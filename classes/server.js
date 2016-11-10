const browserSync = require('browser-sync');
const extend = require('xtend');

class Server {
  constructor(options) {
    this.devServer = browserSync.create();
    this.options = options;
  }
  develop(_options) {
    const options = extend(this.options, _options || {});
    for (const module of options.modules) {
      let count = 0;
      if (typeof module !== 'undefined') {
        let watchIndex = [];
        if (count === 0) {
          watchIndex = [this.options.configuration.index];
        }
        module.dev({ watch: watchIndex }, (moduleBuild) => {
          this.devServer.reload(moduleBuild);
        });
      }
      count += 1;
    }

    this.devServer.init({
      server: options.configuration.web,
    });
  }
}

module.exports = options => new Server(options);
