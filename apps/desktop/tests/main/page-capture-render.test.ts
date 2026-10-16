import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { expect, test } from 'vitest';

const desktopRoot = fileURLToPath(new URL('../../', import.meta.url));

test('real Electron crops cards conservatively and retains the tail beyond one GPU surface', async () => {
  const root = await mkdtemp(join(tmpdir(), 'od-page-capture-'));
  try {
    const moduleUrl = pathToFileURL(join(desktopRoot, 'dist/main/deck-capture.js')).href;
    await writeFile(join(root, 'package.json'), '{"main":"main.cjs"}\n');
    await writeFile(join(root, 'main.cjs'), `
const { app, nativeImage } = require('electron');
const assert = require('node:assert/strict');
app.setPath('userData', ${JSON.stringify(join(root, 'user-data'))});
// Each render owns and closes its window; keep the process alive between cases.
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  const { renderDeckSlides } = await import(${JSON.stringify(moduleUrl)});
  const page = (css, body) => '<!doctype html><html><head><style>body{margin:0}' + css + '</style></head><body>' + body + '</body></html>';
  const cardCss = 'body{min-height:100vh;display:grid;place-items:center}main{width:800px;height:600px;background:rgb(255,0,0)}';
  const card = page(cardCss, '<main>Card</main>');
  const cases = [
    ['card', card, {}, 800, 600],
    ['explicit viewport', card, {width:1200,height:900}, 1200, 900],
    ['backdrop', page(cardCss + 'body{background-image:linear-gradient(blue,green)}', '<main>Card</main>'), {}, 1440, 1000],
    ['shadow', page(cardCss + 'main{box-shadow:0 0 40px black}', '<main>Card</main>'), {}, 1440, 1000],
    ['outline', page(cardCss + 'main{background:blue;outline:20px solid red;outline-offset:10px}', '<main></main>'), {}, 1440, 1000],
    ['body outline', page('body{width:800px;height:600px;margin:200px auto;outline:20px solid red;outline-offset:10px}main{width:800px;height:600px;background:blue}', '<main></main>'), {}, 1440, 1000],
    ['outlined column', page('main{width:800px;height:1400px;margin:100px auto;background:blue;outline:20px solid red;outline-offset:10px}', '<main></main>'), {}, 1440, 1600],
    ['outlined column body', page('body{width:800px;height:1400px;margin:100px auto;outline:20px solid red;outline-offset:10px}main{height:1400px;background:blue}', '<main></main>'), {}, 1440, 1600],
    ['generated content', page(cardCss + 'main::before{content:"outside";position:absolute;left:0}', '<main>Card</main>'), {}, 1440, 1000],
    ['body text', page('main{width:800px;height:600px;margin:auto;background:red}', 'Keep this text<main>Card</main>'), {}, 1440, 1000],
    ['tall column', page('main{width:800px;height:18000px;margin:auto;background:blue;position:relative}footer{position:absolute;bottom:0;width:100%;height:10px;background:red}', '<main><footer></footer></main>'), {}, 800, 18000],
  ];
  for (const [name, html, options, width, height] of cases) {
    const result = await renderDeckSlides({html, deck:false, ...options});
    assert.equal(result.ok, true, name + ': ' + result.error);
    assert.equal(result.slides.length, 1, name);
    const image = nativeImage.createFromDataURL(result.slides[0]);
    assert.deepEqual(image.getSize(), {width, height}, name);
    assert.equal(result.width, width, name);
    assert.equal(result.height, height, name);
    if (name.includes('outline')) {
      const bitmap = image.toBitmap();
      let redPixels = 0;
      for (let i = 0; i < bitmap.length; i += 4) {
        if (bitmap[i] === 0 && bitmap[i + 1] === 0 && bitmap[i + 2] === 255 && bitmap[i + 3] === 255) redPixels++;
      }
      // Outer outline minus its offset gap; retain every authored red pixel.
      assert.equal(redPixels, name.includes('column') ? 91200 : 59200, name + ': outline paint');
    }
    if (name === 'tall column') {
      const bitmap = image.toBitmap();
      const offset = ((height - 2) * width + Math.floor(width / 2)) * 4;
      assert.deepEqual([...bitmap.subarray(offset, offset + 4)], [0, 0, 255, 255], 'tail must be red, not repeated blue page start');
    }
  }
  process.stdout.write('OD_PAGE_CAPTURE_OK:' + cases.length + '\\n');
  app.quit();
}).catch(error => { process.stderr.write(String(error.stack || error)); app.exit(1); });
`);
    const relative = (await readFile(join(desktopRoot, 'node_modules/electron/path.txt'), 'utf8')).trim();
    const electron = join(desktopRoot, 'node_modules/electron/dist', relative);
    const electronArgs = [root, '--disable-gpu', '--force-device-scale-factor=1'];
    const command = process.platform === 'linux' ? 'xvfb-run' : electron;
    const args = process.platform === 'linux' ? ['-a', electron, ...electronArgs, '--ozone-platform=x11'] : electronArgs;
    const env: NodeJS.ProcessEnv = { PATH: process.env.PATH, HOME: root, XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR };
    const { stdout } = await promisify(execFile)(command, args, { env, timeout: 60000, maxBuffer: 1024 * 1024 });
    expect(stdout).toContain('OD_PAGE_CAPTURE_OK:11');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 75000);
