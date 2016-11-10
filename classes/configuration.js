const fs = require('fs');
const q = require('q');

class Configuration {
  constructor(path) {
    this.path = process.cwd() + path;
  }
  load() {
    const deferred = q.defer();
    this.exists().then((success) => {
      if (success) {
        const json = require(this.path);
        deferred.resolve(this.parse(json));
      }
    });
    return deferred.promise;
  }
  parse(json) {
    const data = json || {};
    data.web = `${process.cwd()}/${data.web}`;
    data.bundles = `${process.cwd()}/${data.bundles}`;
    data.index = `${process.cwd()}/${data.index}`;
    const newMmodules = [];
    for (const module of data.modules) {
      newMmodules.push(`${process.cwd()}/${module}`);
    }
    data.modules = newMmodules;

    return data;
  }
  exists() {
    const deferred = q.defer();
    fs.exists(this.path, (exists) => {
      if (exists) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    });
    return deferred.promise;
  }
}

module.exports = path => new Configuration(path);
