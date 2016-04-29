var cli = require('cli');

cli.parse({
    log:   ['l', 'Enable logging'],
    port:  ['p', 'Listen on this port', 'number', 8080]
});

cli.main(function(args, options) {
    this.output('Listening on port ' + options.port);
});

cli.enable('help');
