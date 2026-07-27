#!/usr/bin/env node
// Web smoke test: starts the Expo web dev server on its own port, loads the
// page in headless Chromium, and fails on any HTTP error, console error,
// uncaught page error, or missing expected content (title / Setup screen text).
// This is the same class of bug fix/web-csp-policy fixed — a broken import
// made Metro 500 on the bundle request, which browsers reported as confusing
// CSP/MIME errors instead of a clear build failure.

'use strict';

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const APP_NAME = 'Warmer / Colder'; // must match app.json expo.name (used as the web <title>)
const REPO_ROOT = path.join(__dirname, '..');
const SERVER_READY_TIMEOUT_MS = 60000;
const PAGE_READY_TIMEOUT_MS = 20000;

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for ${url} to respond`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function main() {
  const port = await findFreePort();
  const url = `http://localhost:${port}`;

  console.log(`Starting Expo web dev server on ${url} ...`);
  const server = spawn('npx', ['expo', 'start', '--web', '--port', String(port)], {
    cwd: REPO_ROOT,
    env: { ...process.env, CI: '1' },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  server.stdout.on('data', (d) => (serverOutput += d));
  server.stderr.on('data', (d) => (serverOutput += d));

  const killServer = () => {
    if (server.pid) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch {
        // already dead
      }
    }
  };

  let exitCode = 1;
  try {
    await waitForServer(url, SERVER_READY_TIMEOUT_MS);

    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ locale: 'en-US' });

      const consoleErrors = [];
      const pageErrors = [];
      const failedResponses = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => pageErrors.push(err.message));
      page.on('response', (res) => {
        if (res.status() >= 400) failedResponses.push(`${res.status()} ${res.url()}`);
      });

      const response = await page.goto(url, { waitUntil: 'load', timeout: PAGE_READY_TIMEOUT_MS });
      if (!response || !response.ok()) {
        throw new Error(`Main page responded with status ${response && response.status()}`);
      }

      // Wait for the Setup screen to actually mount (proves the bundle ran, not just loaded).
      await page.getByText('Start', { exact: true }).waitFor({ timeout: PAGE_READY_TIMEOUT_MS });

      const title = await page.title();
      const bodyText = await page.locator('body').innerText();

      const checks = [
        [title === APP_NAME, `Expected page title "${APP_NAME}", got "${title}"`],
        [bodyText.includes('Where are we headed?'), 'Setup screen title text not found in rendered body'],
        [bodyText.includes('Start'), '"Start" button text not found in rendered body'],
        [consoleErrors.length === 0, `Browser console errors:\n${consoleErrors.join('\n')}`],
        [pageErrors.length === 0, `Uncaught page errors:\n${pageErrors.join('\n')}`],
        [failedResponses.length === 0, `Failed network responses:\n${failedResponses.join('\n')}`],
      ];

      const failures = checks.filter(([ok]) => !ok).map(([, msg]) => msg);

      if (failures.length) {
        console.error('FAIL\n' + failures.join('\n\n'));
        exitCode = 1;
      } else {
        console.log('PASS — web build serves OK and renders the Setup screen with no errors.');
        exitCode = 0;
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('FAIL —', err.message);
    console.error('--- dev server output ---');
    console.error(serverOutput);
    exitCode = 1;
  } finally {
    killServer();
  }

  process.exit(exitCode);
}

main();
