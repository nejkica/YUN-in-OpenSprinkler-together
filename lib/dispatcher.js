var fs = require('fs');

var branjePython = require('/root/branjePython.js');


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


  var parts = req.url.split('/');
  //console.log(parts);

  var ajaxtleVar=parts[1].split('&');
  //console.log(ajaxtleVar);



  if (req.url == "/") {
    fs.readFile('/root/canvas3d.html', function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 1');
        serverError(500);
      } else {
        renderHtml(content);
      }
    });

  } else if (ajaxtleVar[0]=='ajaxtle') {
    try {

      var content = branjePython.pyPreberi;
      //console.log(content);
      renderAjax(content);
      //console.log('pošiljam ajax');

    } catch (err) {
      //handle errors gracefully
      console.log('pošiljam 500 - 2');
      serverError(500);
    }
    
  } else {
    //var prvi   = parts[0];
    var drugi = parts[1];

    //console.log(drugi);

    fs.readFile('/root/'+drugi, function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 3');
        serverError(500);
      } else {
        //console.log('pošiljam js');
        renderJS(content);
      }
    });
  }
}