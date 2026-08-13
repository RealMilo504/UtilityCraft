#!/usr/bin/env node

import fs from 'node:fs';

const FILE_STATUSES = new Map([
  [1, 'Processing'],
  [2, 'ChangesRequired'],
  [3, 'UnderReview'],
  [4, 'Approved'],
  [5, 'Rejected'],
  [6, 'MalwareDetected'],
  [7, 'Deleted'],
  [8, 'Archived'],
  [9, 'Testing'],
  [10, 'Released'],
  [11, 'ReadyForReview'],
  [12, 'Deprecated'],
  [13, 'Baking'],
  [14, 'AwaitingPublishing'],
  [15, 'FailedPublishing'],
]);

const TERMINAL_FAILURES = new Set([2, 5, 6, 7, 8, 12, 15]);

function required(value, name) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`${name} is required.`);
  return normalized;
}

function positiveInteger(value, name) {
  const normalized = required(value, name);
  if (!/^\d+$/.test(normalized) || Number(normalized) <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return Number(normalized);
}

function appendFile(path, content) {
  if (path) fs.appendFileSync(path, `${content}\n`, 'utf8');
}

function classification(file) {
  if (file.fileStatus === 10 && file.isAvailable === true && file.downloadUrl) return 'released';
  if (TERMINAL_FAILURES.has(file.fileStatus)) return 'failed';
  if (file.fileStatus === 14) return 'awaiting-publishing';
  return 'pending';
}

async function main() {
  const apiKey = required(process.env.CURSEFORGE_API_KEY, 'CURSEFORGE_API_KEY');
  const projectId = positiveInteger(process.env.CURSEFORGE_PROJECT_ID, 'CURSEFORGE_PROJECT_ID');
  const fileId = positiveInteger(process.env.CURSEFORGE_FILE_ID, 'CURSEFORGE_FILE_ID');
  const endpoint = `https://api.curseforge.com/v1/mods/${projectId}/files/${fileId}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'x-api-key': apiKey,
    },
    signal: AbortSignal.timeout(15_000),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`CurseForge returned HTTP ${response.status} for file ${fileId}.`);
  }

  const payload = JSON.parse(responseBody);
  const file = payload?.data;
  if (!file || Number(file.id) !== fileId || Number(file.modId) !== projectId) {
    throw new Error('CurseForge returned an unexpected file response.');
  }

  const statusCode = Number(file.fileStatus);
  const statusName = FILE_STATUSES.get(statusCode) ?? `Unknown (${statusCode})`;
  const state = classification(file);
  const available = file.isAvailable === true;
  const hasDownload = Boolean(file.downloadUrl);

  appendFile(process.env.GITHUB_OUTPUT, [
    `classification=${state}`,
    `file_status=${statusCode}`,
    `file_status_name=${statusName}`,
    `is_available=${available}`,
    `has_download_url=${hasDownload}`,
  ].join('\n'));

  appendFile(process.env.GITHUB_STEP_SUMMARY, [
    '## CurseForge file status',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Project | ${projectId} |`,
    `| File | ${fileId} |`,
    `| Display name | ${file.displayName || file.fileName || 'Unknown'} |`,
    `| Status | ${statusName} (${statusCode}) |`,
    `| Available | ${available ? 'Yes' : 'No'} |`,
    `| Download URL | ${hasDownload ? 'Available' : 'Not available'} |`,
    `| Monitor classification | ${state} |`,
  ].join('\n'));

  console.log(JSON.stringify({
    projectId,
    fileId,
    displayName: file.displayName || file.fileName,
    statusCode,
    statusName,
    available,
    hasDownload,
    classification: state,
  }));
}

main().catch((error) => {
  console.error(`::error::${error.message}`);
  process.exitCode = 1;
});
