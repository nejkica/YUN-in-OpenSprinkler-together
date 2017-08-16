var ex = require('child_process').exec;

module.exports.reboot = function () {
	ex('/sbin/reboot', function (error, stdout, stderr) {
	//ex('echo "test"', function (error, stdout, stderr) {
		var d = new Date();

		if (error) {
			console.error(d.toISOString() + 'napakaSondeReboot.js - ex error: ${error}');
		    return;
		}
		
		console.log(d.toISOString() + 'sonda kaže napako - 0, zato rebootam ... ${stdout} \n ${stderr}');
	});
};

module.exports.resetirajSkripteStreznika = function () {
	ex('/root/scripts/logRestart.sh', function (error, stdout, stderr) {
	//ex('echo "test"', function (error, stdout, stderr) {
		var d = new Date();

		if (error) {
			console.error(d.toISOString() + 'napakaSondeReboot.js - ex error: ${error} - RESET SKRIPTOV NA STREŽNIKU');
		    return;
		}
		
		console.log(d.toISOString() + 'sonda kaže napako - 0, zato resetiram skripte na strežniku ... ${stdout} \n ${stderr}');
	});
};