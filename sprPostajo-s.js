var http = require(['http']);

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options1 = {
  host: '93.103.1.23', //doma 192.168.123.101
  port: '81',
  path: '/cs?pw=xxx&q0=0'
};

var options2 = {
  host: '93.103.1.23', //doma 192.168.123.101
  port: '81',
  path: '/cm?pw=xxx&sid=6&en=1&t=60'
};

var options3 = {
  host: '93.103.1.23', //doma 192.168.123.101
  port: '81',
  path: '/cm?pw=xxx&sid=6&en=0'
};

var spremeniKorake = function(){http.request(options1).end();}
var odpriVentil = function(){http.request(options2).end();}
var zapriVentil = function(){http.request(options3).end();}

module.exports.spremeniKorake=spremeniKorake;
module.exports.odpriVentil=odpriVentil;
module.exports.zapriVentil=zapriVentil;