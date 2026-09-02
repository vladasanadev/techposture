import { env } from 'node:process';
import { readFileSync, existsSync } from 'node:fs';

const GROUP_NAME = 'Freebie: Automation for Busy Girls';

function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;

    const lines = readFileSync(file, 'utf8').split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key && !(key in env)) {
        env[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }
}

loadLocalEnv();

const token = env.MAILERLITE_API_TOKEN;

if (!token) {
  console.error('MAILERLITE_API_TOKEN is missing. Add it to .env first.');
  process.exit(1);
}

const response = await fetch('https://connect.mailerlite.com/api/groups?limit=100', {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});

if (!response.ok) {
  console.error(`MailerLite group lookup failed with status ${response.status}.`);
  process.exit(1);
}

const payload = await response.json();
const matches = (payload.data || []).filter((group) => group.name === GROUP_NAME);

if (matches.length === 0) {
  console.error(`No exact MailerLite group found for: ${GROUP_NAME}`);
  process.exit(1);
}

if (matches.length > 1) {
  console.error(`More than one exact MailerLite group found for: ${GROUP_NAME}`);
  matches.forEach((group) => console.error(`${group.name}: ${group.id}`));
  process.exit(1);
}

console.log(`Matched group name: ${matches[0].name}`);
console.log(`Matched group ID: ${matches[0].id}`);
console.log('Add this ID to MAILERLITE_FREEBIE_GROUP_ID in .env and your deployment environment.');
