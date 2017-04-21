var fs = require('fs');

fs.readFile('./heuu.log', 'utf8', function (err, data){
		if (err) {
			return console.log(err);
		}

		var prebrano = data.split('\n');
		var vrstic = prebrano.length;
		var vrstica = 5;
		var zapis = '';
		for (var i = 2; i < vrstic; i++) {
			if (vrstica%5===0){
				zapis = prebrano[i].substring(prebrano[i].length-4);
				zapis = zapis.replace('.', ',');
				console.log(zapis);
				fs.appendFileSync('./log/log.txt', zapis + '\n');
			}
			vrstica++;
		}
		
	});
