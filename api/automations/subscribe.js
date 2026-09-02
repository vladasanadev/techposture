const MAILERLITE_SUBSCRIBERS_URL = 'https://connect.mailerlite.com/api/subscribers';
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const REQUEST_TIMEOUT_MS = 8_000;
const rateLimitBuckets = new Map();

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function getClientKey(request) {
  return (
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    request.socket?.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(key) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  return bucket.count > RATE_LIMIT_MAX;
}

function normalizePayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, MAX_NAME_LENGTH) : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const website = typeof body.website === 'string' ? body.website.trim() : '';

  if (website) {
    return { bot: true };
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  return { name, email };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let data = '';

    request.on('data', (chunk) => {
      data += chunk;
      if (data.length > 20_000) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });

    request.on('end', () => resolve(data));
    request.on('error', reject);
  });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { success: false, error: 'Method not allowed.' });
  }

  if (isRateLimited(getClientKey(request))) {
    return sendJson(response, 429, { success: false, error: 'Please wait a minute and try again.' });
  }

  const apiToken = process.env.MAILERLITE_API_TOKEN;
  const groupId = process.env.MAILERLITE_FREEBIE_GROUP_ID;

  if (!apiToken || !groupId) {
    console.error('MailerLite subscribe missing environment variables');
    return sendJson(response, 500, { success: false, error: 'I couldn’t send the guide yet. Please try again.' });
  }

  let parsedBody;

  try {
    const rawBody = typeof request.body === 'string'
      ? request.body
      : request.body
        ? JSON.stringify(request.body)
        : await readBody(request);
    parsedBody = typeof request.body === 'object' && request.body !== null ? request.body : JSON.parse(rawBody || '{}');
  } catch {
    return sendJson(response, 400, { success: false, error: 'Please enter a valid email address.' });
  }

  const normalized = normalizePayload(parsedBody);

  if (normalized.bot) {
    return sendJson(response, 200, { success: true });
  }

  if (normalized.error) {
    return sendJson(response, 400, { success: false, error: normalized.error });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const mailerliteResponse = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalized.email,
        fields: normalized.name ? { name: normalized.name } : {},
        groups: [groupId],
      }),
      signal: controller.signal,
    });

    if (!mailerliteResponse.ok) {
      console.error('MailerLite subscribe failed', {
        status: mailerliteResponse.status,
        emailDomain: normalized.email.split('@')[1] || 'unknown',
      });
      return sendJson(response, 502, { success: false, error: 'I couldn’t send the guide yet. Please try again.' });
    }

    return sendJson(response, 200, { success: true });
  } catch (error) {
    console.error('MailerLite subscribe request error', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return sendJson(response, 502, { success: false, error: 'I couldn’t send the guide yet. Please try again.' });
  } finally {
    clearTimeout(timeout);
  }
}
