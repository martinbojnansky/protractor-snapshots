// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  multiCapabilities: [
    // { 
    //   browserName: 'firefox' ,
    //   firefoxOptions: {
    //     args: ['--headless', '--window-size=1920,4320']
    //   },
    //   'moz:firefoxOptions': {
    //     args: ['--headless']
    //   }
    // }, // In case firefox does not start, try >> node node_modules\protractor\bin\webdriver-manager update
    { 
      browserName: 'chrome',
      chromeOptions: {
        // Window size cannot be changed in headless mode. See https://www.protractortest.org/#/browser-setup#using-headless-chrome
        args: ['no-sandbox', '--headless', "--disable-gpu", '--window-size=1920,4320'],
      }
    }
  ],
  snapshots: {
    dir: 'src',
    pixelmatch: {
      threshold: 0.1
    }
  },
  directConnect: true,
  SELENIUM_PROMISE_MANAGER: false,
  baseUrl: 'http://localhost:4211/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: StacktraceOption.PRETTY
      } 
    }));
  }
};