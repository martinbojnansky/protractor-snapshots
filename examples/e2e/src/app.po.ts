import { browser, by, element, ElementFinder } from 'protractor';

export class AppPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  getTitle(): ElementFinder {
    return element(by.id('title'));
  }

  getParagraph(): ElementFinder {
    return element(by.id('paragraph'));
  }

  getSvg(): ElementFinder {
    return element(by.id('svg'));
  }

  getScrollableWrapper(): ElementFinder {
    return element(by.id('scrollable'));
  }

  getScrollableContent(): ElementFinder {
    return this.getScrollableWrapper().element(by.tagName('p'));
  }
}
