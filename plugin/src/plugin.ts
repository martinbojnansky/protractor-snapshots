import pixelmatch from 'pixelmatch';
import { browser, ElementFinder, ProtractorBrowser } from 'protractor';
import { ProtractorConfig } from './models';
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
  // Read npm command argument for snapshot updating. >> npm run e2e --updateSnapshots=true
  const updateSnapshots =
    process.env['npm_config_updateSnapshots'] === 'true' ? true : false;

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
  if (updateSnapshots) {
    fs.writeFileSync(`${snapshotFolder}/expected.png`, PNG.sync.write(actual));
    fail(
      `The ${uid} snapshot has been updated and should be re-tested. See ${snapshotFolder}`
    );
  }
  // Fail if no update is configured and expected image is missing.
  else if (!expected) {
    fail(
      `An expected ${uid} snapshot has not been yet defined. See ${snapshotFolder}`
    );
  }
  // Fail if any pixel has changed and update has not been configured.
  else if (pixelDiffCount && !updateSnapshots) {
    fail(
      `The ${uid} snapshot has changed. ${pixelDiffCount} pixels does not match. See ${snapshotFolder}`
    );
  }
  // Happy-case :)
  else {
    expect(true).toBe(true);
  }
}
