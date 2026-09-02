const MAILERLITE_SUBSCRIBERS_URL = 'https://connect.mailerlite.com/api/subscribers';
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const REQUEST_TIMEOUT_MS = 8_000;
const rateLimitBuckets = new Map();

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function getClientKey(event) {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  if (isRateLimited(getClientKey(event))) {
    return json(429, { success: false, error: 'Please wait a minute and try again.' });
  }

  const apiToken = process.env.MAILERLITE_API_TOKEN;
  const groupId = process.env.MAILERLITE_FREEBIE_GROUP_ID;

  if (!apiToken || !groupId) {
    console.error('MailerLite subscribe missing environment variables');
    return json(500, { success: false, error: 'I couldn’t send the guide yet. Please try again.' });
  }

  let parsedBody;

  try {
    parsedBody = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Please enter a valid email address.' });
  }

  const normalized = normalizePayload(parsedBody);

  if (normalized.bot) {
    return json(200, { success: true });
  }

  if (normalized.error) {
    return json(400, { success: false, error: normalized.error });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
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

    if (!response.ok) {
      console.error('MailerLite subscribe failed', {
        status: response.status,
        emailDomain: normalized.email.split('@')[1] || 'unknown',
      });
      return json(502, { success: false, error: 'I couldn’t send the guide yet. Please try again.' });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error('MailerLite subscribe request error', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return json(502, { success: false, error: 'I couldn’t send the guide yet. Please try again.' });
  } finally {
    clearTimeout(timeout);
  }
};
