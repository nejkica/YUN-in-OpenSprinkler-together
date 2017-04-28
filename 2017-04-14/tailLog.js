var execFile = require('child_process').execFile;

var stRezultatov = 480;
var vrstArr = '';


var tail = new Array(2);
var tailS = '';
var vrstica = '';

module.exports.tail = function(obdobje, cb) {

	var pot = '/root/.forever/log/dnevni.log';

	switch (obdobje) {
		case 'd':
			stRezultatov = 480;
			pot = '/root/.forever/log/dnevni.log';
			break;
		case 't':
			stRezultatov = 672;
			pot = '/root/.forever/log/tedenski.log';
			break;
		case 'm':
			stRezultatov = 720;
			pot = '/root/.forever/log/mesecni.log';
			break;
	}		

	var label = new Array(stRezultatov);
	var data = new Array(stRezultatov);

	var child = execFile('tail',['-' + stRezultatov, pot], function (err, stout, stderr){
		if (err) {
			throw err;
		}

		vrstArr = stout.split('\n');
		//console.log(vrstArr);
		
		for (var i = 0; i < (vrstArr.length - 1); i++) {
			vrstica = vrstArr[i].split('\t');
			var datum = new Date(vrstica[0]);
			// label[i] = datum.getDate() + '.' + (datum.getMonth()+1) + '.' + datum.getFullYear() + ' ' + datum.getHours() + ':' + datum.getMinutes();
			label[i] = datum;
			data[i] = vrstica[4];
		}

		tail[0] = label;
		tail[1] = data;
		tailS = JSON.stringify(tail);
		
		tail = [];
		label = [];
		data = [];

		cb(tailS);
	});

	// return tailS;
};
