var PythonShell = require('python-shell');
var pyshell = new PythonShell('test.py',{scriptPath:"/root/", pythonOptions: ['-u']});

var msg = 1023;
var pyPreberi = 1; //m3 - 1 je približno desetina bazena
var ka = 818/2.265; //linearna funkcija Hmax = 2.265 m
var stElementov = 36; //ker dnevni log na vsake 3 minute, po 5 s razmak. 
var prvic = 1;
var movAvgArr = new Array(stElementov);
//console.log('berem python');

var alfa = 0.985;

	//try {
pyshell.on('message', function (message) {
  // received a message sent from the Python script (a simple "print" statement)
  //console.log(message);
  msg = message;
  msg = (msg-205)/ka;
  
  if (prvic==1) {
  	pyPreberi=msg;
  	prvic = 0;
  } else {

  }

  pyPreberi = (1 - alfa) * msg + alfa * pyPreberi;

  pyPreberi = pyPreberi.toFixed(3);
  
  if (message === 0) pyPreberi = 0;

  //console.log(msg.toFixed(3) + '\t' + pyPreberi + '\t' + (pyPreberi * 4.3428).toFixed(2));
  module.exports.pyPreberi = pyPreberi.toString();
  //pyPreberi = null;
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
  if (err) throw err;
  // console.log('finished');
});

