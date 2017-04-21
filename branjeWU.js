var http = require('http');

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var obj = JSON.parse(str);
    console.log(obj);
    module.exports.obj=obj; //zato, da lahko potem beremo v drugem skriptu var xxx = require('./branjeOS.js'), in potem xxx.obj in potem xxx.obj.settings ...
  });
}

http.request('http://api.wunderground.com/api/f5b77c6af4030b56/astronomy/q/SI/Ljubljana.json', callback).end();