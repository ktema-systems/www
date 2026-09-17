/**
 * Three ways to inspect the running page, all over the DevTools protocol.
 *
 * The earlier harness used --virtual-time-budget, which starves the frame loop,
 * so the masthead's requestAnimationFrame never ran and every scroll read was
 * stale. This one drives Chrome with real timers.
 *
 *   node .masthead-check.mjs styles <url> [width...]
 *   node .masthead-check.mjs shot <url> <width> <scrollY> <out.png> [extra css]
 *   node .masthead-check.mjs probe <url> <width> <expression.js>
 *
 * probe evaluates the file as a single expression and prints its value as JSON.
 * It is how a figure is checked for collisions and colours: getBBox gives the
 * ink box of a text node in the SVG's own user units, which is the space every
 * coordinate in the source is written in, so the answer is arithmetic rather
 * than a reading of pixels.
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const STYLES = `(async () => {
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';
  const frame = () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  const wait = (ms) => new Promise((done) => setTimeout(done, ms));

  const bar = document.querySelector('.masthead');
  const brand = document.querySelector('.brand');
  const mark = document.querySelector('.brand__mark');
  const inner = document.querySelector('.masthead__inner');
  const h1 = document.querySelector('#top h1');
  const h1Nowrap = (() => {
    const previous = h1.getAttribute('style');
    h1.style.whiteSpace = 'nowrap';
    h1.style.width = 'max-content';
    const width = h1.getBoundingClientRect().width;
    if (previous === null) h1.removeAttribute('style');
    else h1.setAttribute('style', previous);
    return width;
  })();
  const button = document.querySelector('.masthead .btn');

  const read = (tag) => {
    const style = getComputedStyle(bar);
    const progress = style.getPropertyValue('--masthead-progress').trim();
    const scroll = getComputedStyle(root).getPropertyValue('--masthead-scroll').trim();
    return [
      tag.padEnd(20),
      'y=' + String(window.scrollY).padStart(4),
      'scroll=' + scroll.padStart(6),
      'h=' + inner.getBoundingClientRect().height.toFixed(1),
      'brand=' + getComputedStyle(brand).fontSize.padStart(6),
      'mark=' + mark.getBoundingClientRect().width.toFixed(1).padStart(5),
      'box=' + brand.getBoundingClientRect().top.toFixed(1) + '..' + brand.getBoundingClientRect().bottom.toFixed(1),
      'h1=' + h1.getBoundingClientRect().top.toFixed(1) + ' w' + h1.getBoundingClientRect().width.toFixed(0) + ' h' + h1.getBoundingClientRect().height.toFixed(0) + ' lines' + Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)) + ' fs' + getComputedStyle(h1).fontSize,
      'oneline=' + h1Nowrap.toFixed(0) + ' avail=' + document.querySelector('.wrap').clientWidth,
      'head=' + document.querySelector('.hero__head').getBoundingClientRect().width.toFixed(0),
      'fit=' + brand.getBoundingClientRect().width.toFixed(0) + '+' + button.getBoundingClientRect().width.toFixed(0) + '/' + inner.clientWidth,
      'btnright=' + (button.getBoundingClientRect().right - inner.getBoundingClientRect().left).toFixed(0) + ' brandright=' + (brand.getBoundingClientRect().right - inner.getBoundingClientRect().left).toFixed(0),
      'page=' + document.documentElement.scrollWidth + '/' + window.innerWidth,
      'navover=' + (() => {
        const strip = document.querySelector('.masthead__nav');
        return strip.scrollWidth - strip.clientWidth;
      })(),
      'stretch=' + getComputedStyle(brand).fontStretch,
      'filter=' + style.backdropFilter,
      'at-top=' + document.documentElement.classList.contains('is-at-top'),
      'bg=' + style.backgroundColor,
      'rule=' + style.borderBottomColor,
    ].join('  ');
  };

  const lines = [read('at top')];

  const faces = [...document.fonts]
    .filter((face) => face.status === 'loaded')
    .map((face) => face.family + ' ' + face.weight + ' ' + face.stretch);
  lines.push('faces loaded: ' + (faces.join(', ') || 'none'));

  root.style.setProperty('--masthead-scroll', '70');
  lines.push(read('forced 70'));
  root.style.setProperty('--masthead-scroll', '140');
  lines.push(read('forced 140'));
  root.style.setProperty('--masthead-scroll', '9999');
  lines.push(read('forced 9999'));

  await frame();
  root.style.removeProperty('--masthead-scroll');
  await frame();

  for (const target of [70, 400, 0]) {
    window.scrollTo(0, target);
    await frame();
    await wait(60);
    await frame();
    lines.push(read('scrolled to ' + target));
  }
  return lines.join('\\n');
})()`;

function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'masthead-'));
  const child = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profile,
    '--no-first-run',
    '--hide-scrollbars',
    '--window-size=1440,900',
    'about:blank',
  ], { stdio: 'ignore' });

  return new Promise((resolve, reject) => {
    const portFile = join(profile, 'DevToolsActivePort');
    let tries = 0;
    (function poll() {
      tries += 1;
      try {
        resolve({ child, profile, port: readFileSync(portFile, 'utf8').split('\n')[0].trim() });
        return;
      } catch {
        if (tries > 100) {
          reject(new Error('chrome never wrote DevToolsActivePort'));
          return;
        }
        setTimeout(poll, 100);
      }
    })();
  });
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const waiting = this.pending.get(message.id);
      if (!waiting) return;
      this.pending.delete(message.id);
      if (message.error) waiting.reject(new Error(JSON.stringify(message.error)));
      else waiting.resolve(message.result);
    });
  }

  ready() {
    return new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

const [mode, url, ...rest] = process.argv.slice(2);
const { child, profile, port } = await launch();
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const cdp = new Cdp(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
await cdp.ready();
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

async function open(width, height = 900, dpr = 1) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: dpr,
    mobile: false,
  });
  await cdp.send('Page.navigate', { url });
  await new Promise((done) => setTimeout(done, 1200));
}

try {
  if (mode === 'styles') {
    for (const width of rest.map(Number)) {
      await open(width);
      const result = await cdp.send('Runtime.evaluate', {
        expression: STYLES,
        awaitPromise: true,
        returnByValue: true,
      });
      console.log(`=== ${width}px ===`);
      if (result.exceptionDetails) {
        console.log('  threw: ' + JSON.stringify(result.exceptionDetails.exception));
      } else {
        for (const line of result.result.value.split('\n')) console.log('  ' + line);
      }
    }
  } else if (mode === 'shot') {
    const [width, scrollY, out, css, dpr] = rest;
    await open(Number(width), 900, Number(dpr) || 1);
    if (css) {
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const node = document.createElement('style');
          node.textContent = ${JSON.stringify(css)};
          document.head.appendChild(node);
          return true;
        })()`,
        returnByValue: true,
      });
    }
    await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, ${Number(scrollY)});
        await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
        await new Promise((done) => setTimeout(done, 120));
        return window.scrollY;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log('wrote ' + out);
  } else if (mode === 'probe') {
    const [width, path] = rest;
    await open(Number(width));
    const result = await cdp.send('Runtime.evaluate', {
      expression: readFileSync(path, 'utf8'),
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      console.log('threw: ' + JSON.stringify(result.exceptionDetails.exception));
    } else {
      console.log(JSON.stringify(result.result.value, null, 2));
    }
  } else {
    console.log(
      'usage: styles <url> [width...] | shot <url> <width> <scrollY> <out.png> [css] | probe <url> <width> <expression.js>',
    );
  }
} finally {
  cdp.close();
  child.kill('SIGKILL');
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    // Chrome is still tearing its profile down; the directory is in the
    // system temp directory and will be reaped with it.
  }
}
