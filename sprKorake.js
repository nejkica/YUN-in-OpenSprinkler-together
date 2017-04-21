var http = require('http');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: '93.103.1.23', //doma 192.168.123.101
  port: '81',
  path: '/cs?pw=xxx&q0=0'
};

var spremeniKorake = function(){http.request(options).end();}

module.exports.spremeniKorake=spremeniKorake;