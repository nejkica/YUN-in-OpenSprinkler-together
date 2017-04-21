var PythonShell = require(['python-shell']);
var pyshell = new PythonShell('test.py',{scriptPath:"/", pythonOptions: ['-u']});

var pyPreberi = 0;

//console.log('berem python');
	//try {
pyshell.on('message', function (message) {
  // received a message sent from the Python script (a simple "print" statement)
  //console.log(message);
  pyPreberi = message;
  //module.exports.pyPreberi = pyPreberi;
  pyPreberi = null;
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
  if (err) throw err;
  console.log('finished');
});
//} catch (err){
//	console.log(err);


//this.pyPreberi();