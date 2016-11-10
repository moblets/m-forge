const server = require('../classes/server.js');
const prepare = require('./prepare.js');

module.exports = function develop(options) {
  prepare(options, () => {
    server(options).develop();
  });
};
