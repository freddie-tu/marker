#! /usr/bin/env node

var shell = require("shelljs");
var path = require("path");

shell.exec("node_modules\\.bin\\electron-builder install-app-deps");