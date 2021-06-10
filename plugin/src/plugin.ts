import pixelmatch from 'pixelmatch';
import {
  browser,
  by,
  element,
  ElementFinder,
  ProtractorBrowser,
} from 'protractor';
import { ProtractorConfig, Size } from './models';
import fs = require('fs');
const PNG = require('pngjs').PNG;

export async function expectSnapshot(
  uid: string,
  finder: ElementFinder | ProtractorBrowser = browser
): Promise<void> {
  const config = (await browser.getProcessedConfig()) as ProtractorConfig;
  const snapshotFolder = `${config?.configDir?.replace(/\\/g, '/')}/${
    config.snapshots?.dir || 'snapshots'
  }/${uid}`;

  // Resize viewport to screenshot whole page.
  let viewportSize: Size | undefined;
  if (finder === browser) {
    viewportSize = await browser.driver.manage().window().getSize();
    const pageContentSize = await element(by.tagName('html')).getSize();
    await resizeBrowser(pageContentSize);
  }

  // Make sure all necessary directories are created.
  if (!fs.existsSync(snapshotFolder)) {
    fs.mkdirSync(snapshotFolder, { recursive: true });
  }

  // Take screenshot of provided element finder and save it as actual.
  fs.writeFileSync(
    `${snapshotFolder}/actual.png`,
    await finder.takeScreenshot(),
    'base64'
  );

  // Reset original viewport size.
  if (finder === browser && viewportSize) {
    await resizeBrowser(viewportSize);
  }

  // Re-read image from file-system in order to get PNG instance.
  const actual = PNG.sync.read(fs.readFileSync(`${snapshotFolder}/actual.png`));

  // Get previously saved and expected snapshot image.
  let expected: any | undefined;
  let width = 0;
  let height = 0;
  try {
    expected = PNG.sync.read(fs.readFileSync(`${snapshotFolder}/expected.png`));
    width = expected.width;
    height = expected.height;
  } catch {}

  // Create diff image.
  const diff = new PNG({ width, height });
  let pixelDiffCount: number | undefined;
  try {
    pixelDiffCount = pixelmatch(
      expected.data,
      actual.data,
      diff.data,
      width,
      height,
      config?.snapshots?.pixelmatch
    );
  } catch (ex) {
    // If images are not the same size pixelmatch will throw an error.
    pixelDiffCount = width * height;
  }

  // Save diff image to snapshots folder as diff.
  fs.writeFileSync(`${snapshotFolder}/diff.png`, PNG.sync.write(diff));

  // If update snapshots is configured, override expected image with actual and fail.
  if (config?.snapshots?.update) {
    fs.writeFileSync(`${snapshotFolder}/expected.png`, PNG.sync.write(actual));
    fail(
      `The ${uid} snapshot has been updated and should be re-tested. See ${snapshotFolder}`
    );
  }
  // Fail if no update is configured and expected snapshot is missing.
  else if (!expected) {
    fail(
      `An expected ${uid} snapshot has not been yet defined. See ${snapshotFolder}`
    );
  }
  // Fail if any pixel has changed and update has not been configured.
  else if (pixelDiffCount && !config?.snapshots?.update) {
    fail(
      `The ${uid} snapshot has changed. ${pixelDiffCount} pixels does not match. See ${snapshotFolder}`
    );
  }
  // Happy-case :)
  else {
    expect(true).toBe(true);
  }
}

export async function resizeBrowser(size: Size): Promise<void> {
  await browser.driver.manage().window().setSize(size.width, size.height);
}
