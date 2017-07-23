import { PgAssignment } from './app.po';

describe('PgAssignment App', () => {
  let page: PgAssignment;

  beforeEach(() => {
    page = new PgAssignment();
  });

  it('should display an app title of Log File Viewer', () => {
    page.navigateTo();
    expect(page.getAppTitle()).toEqual('Log File Viewer');
  });
});
