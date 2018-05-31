var vm = require("vm");
var Canvas = require("canvas");
var GifEncoder = require("gif-encoder");
var request = require("request");

function getDweetCode() {
	return new Promise(function(resolve, reject) {
		request("https://www.dwitter.net/api/dweets/?limit=1", function (error, response, body) {
  			var code = JSON.parse(body).results.code
			resolve(code);
		});
	});
}

function getFrames(cb) {
	return new Promise(function(resolve, reject) {
	getDweetCode().then(function(code) {
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
				frameArray.push(ctx.getImageData(0, 0, can.width, can.height).data);
				context.t += 100;
				timesaround += 1;
			} else {
				clearInterval(intervalId);
				resolve(frameArray);
			}
		}, 100);
	});
	});
}

function start() {
	getFrames().then(function(frames) {
		var gif = new GifEncoder(1920, 1080);
		gif.setDelay(100);
		gif.setRepeat(0);
		frames.forEach(function(frame) {
			gif.addFrame(frame);
		});
		gif.finish();
	});
}
