import { browser } from 'protractor';
import { expectSnapshot } from 'protractor-snapshots';
import { AppPage } from './app.po';

describe('App', () => {
  let page: AppPage;

  beforeAll(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('should display page', async () => {
    await expectSnapshot('app/page', browser);
  });

  it('should display title', async () => {
    await expectSnapshot('app/title', page.getTitle());
  });

  it('should display paragraph', async () => {
    await expectSnapshot('app/paragraph', page.getParagraph());
  });

  it('should display svg', async () => {
    await expectSnapshot('app/svg', page.getSvg());
  });

  it('should display scrollable', async () => {
    await expectSnapshot('app/scrollable-wrapper', page.getScrollableWrapper());
    // await expectSnapshot('app/scrollable-content', page.getScrollableContent());
  });
});
