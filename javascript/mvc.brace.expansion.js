const Max = require('max-api');
const braces = require('braces');

// This will be printed directly to the Max console
// Max.post(`Loaded the ${path.basename(__filename)} script`);


// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler("expand-old", (...args) => {
	
	// callback return address is last argument
	var addr = args[args.length - 1];

	// string to expand is everything before last argument
	// var msg = "";
	// if (args.length > 2) {
	// 	msg = "{" + args.slice(0, args.length - 1).join('|') + "}"; // if multiple string to expand, combine them with "|", so that they get expanded in that order
	// 		}
	// else {
	// 	msg = args[0];
	// 	}
	
	// expand only once if all elements are the same ?
	// const allEqual = arr => arr.every( v => v === arr[0] )

	var result = [];
	var expansion = [];
	expansion = args.slice(0, args.length - 1).join(' '); 
	//expansion = expansion.concat(args.slice(0, args.length - 1));
	Max.outlet("send", addr);
	Max.outlet("expansion", expansion);

	for (let i = (args.length - 2); i >= 0 ; i--) {
			var msg = "";
			msg = args[i];
			if (msg.includes("{")) {
				// escape brackets and all -------------
				// WARNING : order of the 2 following escape functions do matter!!
				//Max.post("msg", msg);
				var escaped = escapeMultiSlashes(msg);
				escaped = escapePipeSign(escaped);
				escaped = escapeRegExp(String(escaped));
				// Max.outlet("escape", escaped);
				if (!addr) addr = 'none';
				// expand with output limit set to 1000 (default)
				// see https://www.npmjs.com/package/braces for more info
				result = braces([escaped], { expand: true, maxLength: 1000, rangeLimit:1000 });
			}
			else {
				result = [msg];
			}
			result = ["result"].concat(i+1, result);
			Max.outlet(result);
	}
});


// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler("expand", (...args) => {
	
	// callback return address is last argument
	var addr = args[args.length - 1];
	var uid = args[args.length - 2];

	// string to expand is everything before last argument
	// var msg = "";
	// if (args.length > 2) {
	// 	msg = "{" + args.slice(0, args.length - 1).join('|') + "}"; // if multiple string to expand, combine them with "|", so that they get expanded in that order
	// 		}
	// else {
	// 	msg = args[0];
	// 	}

	var result = [];
	var expansion = [];
	expansion = args.slice(0, args.length - 2).join(' '); 
	//expansion = expansion.concat(args.slice(0, args.length - 1));
	Max.outlet("send", addr);
	Max.outlet("uid", uid);
	Max.outlet("expansion", expansion);

	for (let i = (args.length - 3); i >= 0 ; i--) {
			var msg = "";
			msg = args[i];
			if (msg.includes("{")) {
				// escape brackets and all -------------
				// WARNING : order of the 2 following escape functions do matter!!
				//Max.post("msg", msg);
				var escaped = escapeMultiSlashes(msg);
				escaped = escapePipeSign(escaped);
				escaped = escapeRegExp(String(escaped));
				// Max.outlet("escape", escaped);
				if (!addr) addr = 'none';
				// expand with output limit set to 1000 (default)
				// see https://www.npmjs.com/package/braces for more info
				result = braces([escaped], { expand: true, maxLength: 1000, rangeLimit:1000 });
			}
			else {
				result = [msg];
			}
			result = ["result"].concat(i+1, result);
			Max.outlet(result);
	}
});

// braces(patterns[, options]);

//Max.post(braces(['{01..05}', '{a..e}']));
//=> ['(0[1-5])', '([a-e])']

//Max.post(braces(['lowpass{A..z}', '{a..e}'], { expand: true }));
//=> ['01', '02', '03', '04', '05', 'a', 'b', 'c', 'd', 'e']

//https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(string) {
  //return string.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'); // $& means the whole matched string
	return string.replace(/[*+?^$|[\]\\]/g, '\\$&'); // $& means the whole matched string

}
function escapePipeSign(string) {
  //return string.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'); // $& means the whole matched string
	return string.replace(/[|]/g, '\,'); // $& means the whole matched string

}
function escapeMultiSlashes(string) {
  //return string.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'); // $& means the whole matched string
	return string.replace(/\/+/g, '/'); // $& means the whole matched string

}

