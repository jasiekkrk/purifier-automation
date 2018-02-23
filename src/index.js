"use strict";
exports.__esModule = true;
var Purifier_1 = require("./device/Purifier");
var device = new Purifier_1["default"]();
device.connect().then(function () { return device.on(); });
