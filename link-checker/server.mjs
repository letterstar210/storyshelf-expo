import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { isIP } from 'node:net';
import { chromium } from 'playwright';

const PORT = Number(process.env.LINK_CHECKER_PORT || 4317);
const MAX_ACTIVE_CHECKS = 2;
const chapterPattern = /(?:chapter|episode|ep\.?|ตอนที่)\s*([0-9]+(?:\.[0-9]+)?)/gi;
const chapterOptionSelector =
  '#chapter option, select[name="chapter"] option, select.single-chapter-select option, select.rsel option, #chapter-select option';

let browser;
let activeChecks = 0;

const getChapterNumbers = (values) => {
  const numbers = [];

  for (const value of values) {
    for (const match of String(value).matchAll(chapterPattern)) {
      const number = Number(match[1]);
      if (Number.isFinite(number)) numbers.push(number);
    }
  }

  return numbers;
};

const getLatestChapter = (values) => {
  const chapters = getChapterNumbers(values);
  return chapters.length > 0 ? Math.max(...chapters) : undefined;
};

const isSecurityChallenge = (title, body) =>
  /just a moment|security verification|verify you are human|checking your browser/i.test(
    `${title} ${body}`
  );

const getSeriesPath = (value) => {
  const path = decodeURIComponent(new URL(value).pathname)
    .toLowerCase()
    .replace(/\/+$/, '');

  return path.replace(/(?:[-/](?:chapter|episode|ep\.?|ตอนที่)[\s_-]*\d+(?:\.\d+)?)$/, '');
};

const getSameSeriesChapterTexts = (links, pageUrl) => {
  const seriesPath = getSeriesPath(pageUrl);

  return links
    .filter((link) => {
      try {
        return getSeriesPath(link.href) === seriesPath;
      } catch {
        return false;
      }
    })
    .map((link) => link.text);
};

const getSavedChapterNumber = (value) => {
  const labeledChapter = getChapterNumbers([value])[0];

  if (Number.isFinite(labeledChapter)) {
    return labeledChapter;
  }

  const bareChapter = String(value).match(/[0-9]+(?:\.[0-9]+)?/);
  return bareChapter ? Number(bareChapter[0]) : undefined;
};

const formatChapter = (value) => String(value).replace(/\.0+$/, '');

const isPrivateIpv4 = (value) => {
  const [first, second] = value.split('.').map(Number);
  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

const validateTargetUrl = (value) => {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    (isIP(hostname) === 4 && isPrivateIpv4(hostname)) ||
    (isIP(hostname) === 6 && hostname !== '::1')
  ) {
    throw new Error('Only public HTTP or HTTPS reading links can be checked.');
  }

  return url.toString();
};

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
};

const getBrowser = async () => {
  browser ??= await chromium.launch({ headless: true });
  return browser;
};

const inspectLink = async (urlValue, savedEpisode) => {
  const url = validateTargetUrl(urlValue);
  const page = await (await getBrowser()).newPage();

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForTimeout(800);

    const statusCode = response?.status() ?? 0;
    const finalUrl = new URL(validateTargetUrl(page.url()));
    const checkedAt = new Date().toISOString();
    const title = await page.title();
    const bodyText = await page.locator('body').innerText();

    if (statusCode === 404 || statusCode === 410) {
      return {
        status: 'broken',
        checkedAt,
        sourceHost: finalUrl.hostname,
        message: `The site returned HTTP ${statusCode}.`,
      };
    }

    if (isSecurityChallenge(title, bodyText)) {
      return {
        status: 'check-failed',
        checkedAt,
        sourceHost: finalUrl.hostname,
        message: 'This site blocks automated checks with a security verification page.',
      };
    }

    // Chapter selectors belong to the current reader; unrelated links are fallback only.
    let latest = getLatestChapter(await page.locator(chapterOptionSelector).allTextContents());

    if (latest === undefined) {
      const links = await page.locator('a').evaluateAll((nodes) =>
        nodes.map((node) => ({
          href: node.href,
          text: node.textContent ?? '',
        }))
      );
      latest = getLatestChapter(getSameSeriesChapterTexts(links, finalUrl.toString()));
    }

    if (latest === undefined) {
      return {
        status: 'check-failed',
        checkedAt,
        sourceHost: finalUrl.hostname,
        message: 'No chapter list was found on this page.',
      };
    }

    const saved = getSavedChapterNumber(savedEpisode);
    const updateCount = Number.isFinite(saved) ? Number((latest - saved).toFixed(2)) : undefined;

    return {
      status: updateCount !== undefined && updateCount > 0 ? 'update-available' : 'up-to-date',
      checkedAt,
      latestEpisode: formatChapter(latest),
      updateCount: updateCount && updateCount > 0 ? updateCount : undefined,
      sourceHost: finalUrl.hostname,
      message:
        saved === undefined
          ? 'A latest chapter was found, but the saved chapter is not a number.'
          : undefined,
    };
  } finally {
    await page.close();
  }
};

const getLocalUrls = () => {
  const addresses = [];

  for (const network of Object.values(networkInterfaces())) {
    for (const item of network ?? []) {
      if (item.family === 'IPv4' && !item.internal) {
        addresses.push(`http://${item.address}:${PORT}`);
      }
    }
  }

  return addresses;
};

const runSelfTest = () => {
  assert.deepEqual(getChapterNumbers(['Chapter 173', 'ตอนที่ 170', 'ignore']), [173, 170]);
  assert.equal(getLatestChapter(['ตอนที่ 173', 'Chapter 170']), 173);
  assert.equal(isSecurityChallenge('Just a moment...', 'Performing security verification'), true);
  assert.deepEqual(
    getSameSeriesChapterTexts(
      [
        { text: 'Chapter 66', href: 'https://example.com/side-character-%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B8%97%E0%B8%B5%E0%B9%88-66/' },
        { text: 'Chapter 132', href: 'https://example.com/another-series-%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B8%97%E0%B8%B5%E0%B9%88-132/' },
      ],
      'https://example.com/side-character-%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B8%97%E0%B8%B5%E0%B9%88-66/'
    ),
    ['Chapter 66']
  );
  assert.equal(getSavedChapterNumber('170'), 170);
  console.log('Link checker parser self-test passed.');
};

if (process.argv.includes('--self-test')) {
  runSelfTest();
  process.exit(0);
}

const server = createServer(async (request, response) => {
  console.log(`${new Date().toISOString()} ${request.socket.remoteAddress} ${request.method} ${request.url}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { status: 'ok', urls: getLocalUrls() });
    return;
  }

  if (request.method !== 'POST' || request.url !== '/check') {
    sendJson(response, 404, { error: 'Use GET /health or POST /check.' });
    return;
  }

  if (activeChecks >= MAX_ACTIVE_CHECKS) {
    sendJson(response, 429, { error: 'The checker is busy. Try again shortly.' });
    return;
  }

  activeChecks += 1;

  try {
    const body = await readJsonBody(request);
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const savedEpisode = typeof body.savedEpisode === 'string' ? body.savedEpisode.trim() : '';

    if (!url) throw new Error('A reading link is required.');

    const result = await inspectLink(url, savedEpisode);
    sendJson(response, 200, { ...result, savedEpisode });
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : 'The link could not be checked.',
    });
  } finally {
    activeChecks -= 1;
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Link Checker is running on port ${PORT}.`);
  console.log('Use one of these addresses in the mobile app:');
  for (const url of getLocalUrls()) console.log(`  ${url}`);
});

const shutdown = async () => {
  await browser?.close();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
