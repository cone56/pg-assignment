import { browser, by, element } from 'protractor';

export class PgAssignment {
  navigateTo() {
    return browser.get('/');
  }

  getAppTitle() {
    return element(by.css('app-root h1')).getText();
  }
}
