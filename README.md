# marker

A simple markdown editor that can print and do equations.


### Build and debug
The app uses electron with a typescript host and a vue.js client application. To instal the packages use
```
npm install
```

to build and start debugging in visual studio code
```
npm run watch
press F5
```

logfiles will stored at
%APPDATA%\\marker\\marker.log.json

the optional config file will be read from 
%APPDATA%\\marker\\marker.config.json

example:
```
{
	"debug": true,
	"log-level": "debug"
}
```
when debug is set to true, a new menu option will appear in Help/debug.

### Release
for a rease build use
```
npm run build:prod
npm run release
```

