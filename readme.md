# mForge
mForge is a package and cli for broserify, minify and revision moblets packs to
use with base-ionic-project of moblets

### Version
1.8.2


## OPTIONS

- [-m] set build bundle option to minified. (use only in production ci build)

- [-a] the app id. default is the test_superclasses id.

- [-e] set the environment of server and app, possibles 'dev' , 'local' ,
'production'

- [-t] set the target of build, possibles 'mobile' and 'web'

- [-p] the server port


## COMMANDS

### PREPARE

Prepare files for deploy, make bundle usually runs in ci.

```
$ m-forge prepare [-m]  [-e <environment>]  [-t <target>] [-a <appId>]
```
### DEVELOP

Runs a livereload development server.

```
$ m-forge development [-e <environment>] [-a <appId>]
```
### MOBILE

Change configurations for mobile build.

```
$ m-forge mobile [-m] [-e <environment>] [-a <appId>]
```

### WEBSERVER

Change configurations and runs a webserver for the preview.

```
$ m-forge webserver [-e <environment>]
```

## TODO

- refactor the revision option
- fix moblet development
- integrate with moblet scaffold

## CHANGELOG

<v.1.8.2>
 - allow images URLs to be HTTP or HTTPS

<v.1.8.1>
 - add change facebook id and name in jsons for platforms

<v.1.8.0>
 - fix multiple bugs
 - add new options for NAUVA
