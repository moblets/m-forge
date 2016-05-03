# mForge
mforge is a package and cli for broserify, minify and revision moblets packs
### Version
1.0.0

### COMMAND LINE INTERFACE
```
$ mforge target destination -m -r
```
 -m minify the bundle
 
 -r revision the bundle

### NODE MODULE
```
var mForge = require('mForge');
mForge.bundle.compile('file', 'dest', true, true);
```
