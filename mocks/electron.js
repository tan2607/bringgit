// mocks/electron.js
module.exports = {
    // Provide only the stubs you need
    app: {
      on() {},
      getPath() { return ''; },
      // etc.
    },
    BrowserWindow: class {},
    // Other top-level APIs or classes
  };
  