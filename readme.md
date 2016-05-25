# mForge
mforge is a package and cli for broserify, minify and revision moblets packs to use with base-ionic-project of moblets

## ATENTION
USE ONLY THE CLI IN THE base-ionic-project ROOT!
current base-ionic-project branch for use this is newMForge .

### Version
1.1.1

### PREPARE

Prepare files for deploy, make bundle cummon runs in ci.

```
$ m-forge prepare [-m] [-r]
```
 - [-m] minify the bundles
 
 - [-r] revision the bundles and create a index-rev.html file with bundles link with revision hash
 
 
### MOBLET DEVELOP

Run a livereload and watch server for development a moblet, and inject the moblet bundle in base-ionic-project and watchs it too.

```
$ m-forge moblet <moblet-name> <moblet-project-folder>  [-a <appId>] [-e <environment>]
```
- [-e] set the environment of server and app, possibles 'dev' , 'local' , 'production'

- [-p] the server port

- [-r] use the revision index-rev.html file made in prepare



### DEVELOP

Run a livereload and watch server for development

```
$ m-forge develop  [-a <appId>] [-e <environment>]
```
- [-e] set the environment of server and app, possibles 'dev' , 'local' , 'production'

- [-p] the server port

- [-r] use the revision index-rev.html file made in prepare



### WEBSERVER

Prepare and run a webserver in express with base-ionic-project, read a file with env variable in base-ionic-project root, and use it to change the variables in the project.

```
$ m-forge webserver [-p <port>] [-e <environment>] [-r]
```

- [-e] set the environment of server and app, possibles 'dev' , 'local' , 'production'

- [-p] the server port

- [-r] use the revision index-rev.html file made in prepare


### MOBILE

Prepare the base-ionic-project to be build for mobile

```
$ m-forge mobile [-a <appId>] [-e <environment>]
```

- [-e] set the environment of server and app, possibles 'dev' , 'local' , 'production'

- [-a] the app id. default is the test_superclasses id.
