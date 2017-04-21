var http = require('http');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: '192.168.2.11', //doma 192.168.123.101
  path: '/ja?pw=xxx'
};

var cb = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var obj = JSON.parse(str);
    str = null;
    module.exports.obj=obj; //zato, da lahko potem beremo v drugem skriptu var xxx = require('./branjeOS.js'), in potem xxx.obj in potem xxx.obj.settings ...
  
  });
};

http.request(options, cb).end();

var klicInt = setInterval(function(){
  http.request(options, cb).end();

}, 60000);

//module.exports.klicInt=klicInt; 