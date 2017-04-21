var http = require('http');

var options = {
    host: '192.168.123.101/',
    path: '/jp?pw=xxx'
}
var request = http.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        console.log(data.toString());

    });
});
request.on('error', function (e) {
    console.log(e.message);
});
request.end();