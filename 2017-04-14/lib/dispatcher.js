var fs = require('fs');

var branjePython = require('/root/branjePython.js');
var branjeTail = require('/root/tailLog.js'); 
var zlib = require('zlib');
var stream = require('stream');
//var a = 0;

//function zapisiVrednost(vrednost) {
//  var a=vrednost;   
//  return a;
//}


this.dispatch = function(req, res) {

  //some private methods
  var serverError = function(code, content) {
    res.writeHead(code, {'Content-Type': 'text/plain'});
    res.end(content);
    content = null;
  };

  var renderHtml = function(content) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(content, 'utf-8');
    content = null;
  };

  var renderJS = function(content) {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(content, 'utf-8');
    content = null;
  };

  var renderAjax = function(content) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(content, 'utf-8');
    content = null;
  };

  var renderAjax1 = function(content) {
    var txt = new stream.PassThrough();
    txt.write(content);
    txt.end();

    var acceptEncoding = req.headers['accept-encoding'];
    // var input = new Buffer(content, 'utf-8');
    if (!acceptEncoding) {
      acceptEncoding = '';
    }

    if (acceptEncoding.match(/\bdeflate\b/)) {
      res.writeHead(200, {'Content-Type': 'text/javascript',
                          'Content-Encoding': 'deflate' });
      txt.pipe(zlib.createDeflate()).pipe(res);

    } else if (acceptEncoding.match(/\bgzip\b/)) {
      res.writeHead(200, {'Content-Type': 'text/javascript',
                          'Content-Encoding': 'gzip'
                          });
      txt.pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      txt.pipe(res);
    }

    
    // res.end();
    content = null;
  };


  var parts = req.url.split('/');
  //console.log(parts);

  var ajaxtleVar=parts[1].split('&');
  //console.log(ajaxtleVar);



  if (req.url == "/") {
    fs.readFile('/root/canvas3d.html', function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 1 ' + error);
        serverError(500);
      } else {
        renderHtml(content);
      }
    });

  } else if (ajaxtleVar[0]=='ajaxtle') {
    try {

      var content = branjePython.pyPreberi;
      //console.log("tole vrne: " + content);
      renderAjax(content);
      //console.log('pošiljam ajax');

    } catch (err) {
      //handle errors gracefully
      //console.log(err);
      console.log('pošiljam 500 - 2: ' + err );
      serverError(500);
    }
    
  } else if (req.url == "/graf") {
    fs.readFile('/root/chart.html', function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 1 ' + error);
        serverError(500);
      } else {
        renderHtml(content);
      }
    });
    
  } else if (ajaxtleVar[0]=='chart') {
    try {
      var obdobje = ajaxtleVar[1];

      var ctn = branjeTail.tail(obdobje, function(rtrn){
        // console.log(rtrn);
        // return rtrn;
        renderAjax1(rtrn);
      });
      //console.log("tole vrne: " + content);
      //branjeTail = null;
      //console.log('pošiljam ajax');

    } catch (err) {
      //handle errors gracefully
      //console.log(err);
      console.log('pošiljam 500 - 3: ' + err );
      serverError(500);
    }
  } else {  
    //var prvi   = parts[0];
    var drugi = parts[1];

    //console.log(drugi);

    fs.readFile('/root/'+drugi, function(error, content) {
      if (error) {
        console.log('pošiljam 404 ' + error);
        serverError(404);
      } else {
        //console.log('pošiljam js');
        renderJS(content);
      }
    });
  }
};