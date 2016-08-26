var fs = require('fs');
var awesome = require('awesome-logs');
module.exports = {
  destination: function(file) {
    var pathSplit = file.split("/");
    var fileName = pathSplit[pathSplit.length - 1];
    return file.replace(fileName, "");
  },
  loadTemplate: function(template, callback) {
    fs.readFile(template, 'utf8', function(err, data) {
      if (err) {
        awesome.error(err);
      } else {
        callback(data);
      }
    });
  }
};
