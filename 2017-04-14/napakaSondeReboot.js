var ex = require('child_process').exec;

module.exports.reboot = function () {
	ex('/sbin/reboot', function (error, stdout, stderr) {
	//ex('echo "test"', function (error, stdout, stderr) {
		if (error) {
			console.error('napakaSondeReboot.js - ex error: ${error}');
		    return;
		}
		
		console.log('sonda kaže napako - 0, zato rebootam ... ${stdout} \n ${stderr}');
	});
};