import { browser, logging } from 'protractor';
import { expectSnapshot } from 'protractor-snapshots';
import { AppPage } from './app.po';

describe('App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should load', async () => {
    await page.navigateTo();
    await expectSnapshot('app/page--loaded', browser);
    await expectSnapshot('app/title--loaded', page.getTitle());
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry)
    );
  });
});
