#!/usr/bin/env node

import fs from 'node:fs';

function required(value, name) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`${name} is required.`);
  return normalized;
}

function enabled(value) {
  return String(value ?? '').toLowerCase() === 'true';
}

function truncate(value, maximum) {
  const normalized = String(value ?? '').trim();
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function releaseSummary(body) {
  const lines = String(body ?? '').replaceAll('\r\n', '\n').split('\n');
  const firstHeading = lines.findIndex((line) => /^#\s+/.test(line.trim()));
  const summaryStart = firstHeading >= 0 ? firstHeading + 1 : 0;
  const summary = [];

  for (let index = summaryStart; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (/^##\s+/.test(line) || /^---+$/.test(line)) break;
    if (line) summary.push(line);
  }

  const highlightsHeading = lines.findIndex((line) => /^##\s+HIGHLIGHTS\s*$/i.test(line.trim()));
  if (highlightsHeading < 0) {
    throw new Error('The release notes must contain a "## HIGHLIGHTS" section.');
  }

  const highlights = [];
  for (let index = highlightsHeading + 1; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();
    if (/^##\s+/.test(line.trim()) || /^---+$/.test(line.trim())) break;
    if (line.trim()) highlights.push(line);
  }

  if (!summary.length) throw new Error('The release notes need a short introduction before HIGHLIGHTS.');
  if (!highlights.length) throw new Error('The HIGHLIGHTS section cannot be empty.');

  return {
    description: truncate(summary.join('\n'), 2000),
    highlights: truncate(highlights.join('\n'), 1024),
  };
}

function appendSummary(markdown) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) fs.appendFileSync(summaryPath, `${markdown}\n`, 'utf8');
}

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const release = JSON.parse(await readStandardInput());
  const releaseName = required(release.name || release.tag_name, 'Release name');
  const releaseUrl = required(release.html_url, 'Release URL');
  const projectName = required(process.env.PROJECT_NAME, 'PROJECT_NAME');
  const projectPageUrl = required(process.env.PROJECT_PAGE_URL, 'PROJECT_PAGE_URL');
  const curseForgeUrl = required(process.env.CURSEFORGE_URL, 'CURSEFORGE_URL');
  const mcpedlUrl = required(process.env.MCPEDL_URL, 'MCPEDL_URL');
  const imageUrl = required(process.env.ANNOUNCEMENT_IMAGE_URL, 'ANNOUNCEMENT_IMAGE_URL');
  const color = Number.parseInt(process.env.ANNOUNCEMENT_COLOR || '769050', 16);
  const {description, highlights} = releaseSummary(release.body);
  const shouldPing = enabled(process.env.PING_UPDATES);
  const shouldSend = enabled(process.env.SEND_TO_DISCORD);
  const roleId = shouldPing ? required(process.env.DISCORD_UPDATES_ROLE_ID, 'DISCORD_UPDATES_ROLE_ID') : '';

  const links = [
    `[Website](${projectPageUrl})`,
    `[Full Changelog](${releaseUrl})`,
    `[CurseForge](${curseForgeUrl})`,
    `[MCPEDL](${mcpedlUrl})`,
  ].join(' · ');

  const payload = {
    username: 'Dorios Studios Updates',
    content: shouldPing ? `<@&${roleId}>` : undefined,
    allowed_mentions: shouldPing ? {roles: [roleId]} : {parse: []},
    embeds: [
      {
        author: {name: 'Update'},
        title: releaseName,
        url: releaseUrl,
        description,
        color,
        fields: [
          {name: 'HIGHLIGHTS', value: highlights},
          {name: 'LINKS', value: links},
        ],
        image: {url: imageUrl},
        footer: {text: `Dorios Studios • ${projectName}`},
        timestamp: release.published_at || undefined,
      },
    ],
  };

  const preview = [
    '## Discord release announcement',
    '',
    `**Mode:** ${shouldSend ? 'Send to Discord' : 'Preview only'}`,
    `**Role ping:** ${shouldPing ? `Yes (role ${roleId})` : 'No'}`,
    '',
    `### [${releaseName}](${releaseUrl})`,
    '',
    description,
    '',
    '#### HIGHLIGHTS',
    highlights,
    '',
    links,
  ].join('\n');
  appendSummary(preview);

  if (!shouldSend) {
    console.log('Preview generated successfully. Enable send_to_discord to publish it.');
    return;
  }

  const webhookUrl = required(process.env.DISCORD_RELEASE_WEBHOOK_URL, 'DISCORD_RELEASE_WEBHOOK_URL');
  const separator = webhookUrl.includes('?') ? '&' : '?';
  const response = await fetch(`${webhookUrl}${separator}wait=true`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Discord returned HTTP ${response.status}: ${truncate(responseBody, 500)}`);
  }

  const message = JSON.parse(responseBody);
  const messageUrl = message.guild_id && message.channel_id && message.id
    ? `https://discord.com/channels/${message.guild_id}/${message.channel_id}/${message.id}`
    : undefined;
  appendSummary(messageUrl ? `\n**Published message:** ${messageUrl}` : '\n**Published successfully.**');
  console.log(messageUrl ? `Discord announcement published: ${messageUrl}` : 'Discord announcement published.');
}

main().catch((error) => {
  console.error(`::error::${error.message}`);
  process.exitCode = 1;
});
