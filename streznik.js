

//console.log(process.pid);
 
// after this point, we are a daemon 
//require('daemon')();
 
// different pid because we are now forked 
// original parent has exited 
//console.log(process.pid);

//include our modules
var sys   = require('sys');
var http  = require('http');
var url   = require('url');

//require custom dispatcher
var dispatcher = require('/root/lib/dispatcher.js');


// console.log('Strežnik @ http://ivanc/');

http.createServer(function (req, res) {
  //wrap calls in a try catch
  //or the node js server will crash upon any code errors
  try {
    //pipe some details to the node console
    console.log('Incoming Request from: ' + req.connection.remoteAddress + ' for href: ' + url.parse(req.url).href
    );
    //console.log(req);


  //dispatch our request
  dispatcher.dispatch(req, res);

  } catch (err) {
      //handle errors gracefully
      sys.puts(err);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }).listen(80, function() {
    //runs when our server is created
    console.log('Server running at http://192.168.123.44:80');
  });