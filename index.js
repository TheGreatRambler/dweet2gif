var vm = require("vm");
var Canvas = require("canvas");
var GIFEncoder = require("gifencoder");
var request = require("request");

function getDweetCode(cb) {
	request("https://www.dwitter.net/api/dweets/?limit=1", function (error, response, body) {
  		var code = JSON.parse(body).results.code
		cb(code);
	});
}

function getFrames(cb) {
	getDweetCode(function(code) {
		var framestouse = 50;
		var can = new Canvas(1920, 1080);
		var ctx = can.getContext("2d");
		var frameArray = [];
		var sandbox = {
			S: Math.sin,
			C: Math.cos,
			T: Math.tan,
			R: function(r, g, b, a) {
				return "rgba("+r+","+g+","+b+","+a+")";
			},
			c: can,
			x: ctx,
			t: 0
		};
		var script = new vm.Script(code);
		var context = vm.createContext(sandbox);
		var timesaround = 0;
		var intervalId = setInterval(function() {
			if (timesaround < framestouse) {
				script.runInContext(context);
				frameArray.push(can.toBuffer());
				context.t += 100;
				timesaround += 1;
			} else {
				clearInterval(intervalId);
				cb(frameArray);
			}
		}, 100);
	});
}
