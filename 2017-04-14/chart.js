$('.gumbD').on('click', function() { 
	prejmiPodatke('d');
});
$('.gumbT').on('click', function() {
	// console.log('klik na t ');
	prejmiPodatke('t');
});
$('.gumbM').on('click', function() {
	prejmiPodatke('m');
});

var graf = document.getElementById("myChart");
var ctx = graf.getContext("2d");
ctx.clearRect(0,0,graf.width,graf.height);
ctx.save();

var myLineChart;

function aktivniGumb(termin) {
	// console.log('aktivni gumb ' + termin);
	var defColor = 'rgba(20, 120, 190, 0.8)';
	var actColor = 'rgba(20, 120, 190, 1.0)';
	$('.gumbD').css('background-color', defColor);
	$('.gumbT').css('background-color', defColor);
	$('.gumbM').css('background-color', defColor);

	if (termin == 'd') {
		$('.gumbD').css('background-color', actColor);
	} else if (termin == 't') {
		$('.gumbT').css('background-color', actColor);
	} else if (termin == 'm') {
		$('.gumbM').css('background-color', actColor);
	}
}


function prejmiPodatke (termin) {
	// console.log('prejmiPodatke ' + termin);
	aktivniGumb(termin);
	//var nalepke = new Array();
	var res = '';
	var nalepke = new Array(0);
	var podatki = new Array(0);
	//var podatki1 = '';
	var obdobje = "&" + termin;
	
	

	nocache = "&nocache=" + Math.random() * 1000000;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function()
	{
		if (this.readyState == 4) {
			if (this.status == 200) {
				if (this.responseText !== null) {
					//res.push(this.responseText);
					res = JSON.parse(this.responseText);
					res[0].forEach(function(r){
						if (r !== null) nalepke.push(r);
					});

					res[1].forEach(function(o){
						if (o !== null) podatki.push(o);
					});
					
					narisiGraf(podatki, nalepke, termin);
					
				}
			}
		}
	};


	request.open("GET", "chart" + obdobje + nocache, true);
	request.send(null);

	// $(window).resize(function() {
	// 	setTimeout(function(){
	// 		$('#myChart').removeAttr('style');
			
	// 	}, 1000);
	// });

}

function narisiGraf (dataIn, labelsIn, termin) {
	var dpr = window.devicePixelRatio;
	var fontSz = 18;

	var delitev = 'hour';
	var razdelitev = 1;

	if (termin == 'd') {
		delitev = 'hour';
		razdelitev = 2;
	} else if (termin == 't') {
		delitev = 'hour';
		razdelitev = 4;
	} else if (termin == 'm') {
		delitev = 'day';
		razdelitev = 2;
	}

	if (myLineChart !== undefined) myLineChart.destroy();

	if (dpr >= 2.0) {
		fontSz = 24;
	}

	
	var data = {
	    labels: labelsIn,
	    datasets: [
	        {
	            label: "Nivo vode v rezervoarju [m3]",
	            fill: true,
	            lineTension: 0.1,
	            backgroundColor: "rgba(75,192,192,0.4)",
	            borderColor: "rgba(75,192,192,1)",
	            borderCapStyle: 'butt',
	            borderDash: [],
	            borderDashOffset: 0.0,
	            borderJoinStyle: 'miter',
	            pointBorderColor: "rgba(75,192,192,1)",
	            pointBackgroundColor: "#fff",
	            pointBorderWidth: 1,
	            pointHoverRadius: 5,
	            pointHoverBackgroundColor: "rgba(75,192,192,1)",
	            pointHoverBorderColor: "rgba(220,220,220,1)",
	            pointHoverBorderWidth: 2,
	            pointRadius: 1,
	            pointHitRadius: 10,
	            data: dataIn,
	            spanGaps: false
	        }
	    ]
	};

	myLineChart = new Chart(ctx, {
					    type: 'line',
					    data: data,
					    options: {
					    	maintainAspectRatio: false,
					        scales: {
					            xAxes: [{
					                	display: true,
					                	type: 'time',
					                	time: {
					                		unit: delitev,
					                		unitStepSize: razdelitev,
											displayFormats: {
											   'minute': 'DD.MM.YYYY HH:mm',
											   'hour': 'DD.MM.YYYY HH:mm',
											   'day': 'DD.MM.YYYY HH:mm',
											   'month': 'DD.MM.YYYY HH:mm',
											   'year': 'DD.MM.YYYY HH:mm'
											},
					                	},
					                	ticks: {
						                    fontSize: fontSz,
						                    minRotation: 90
						                }
					            		}],
					        	yAxes: [
					        			{
							            ticks: 
							            	{
							            		min: 0,
							            		max: 10,
							            		stepSize: 0.5,
							            		fontSize: fontSz
			                            	}
										}
										]
					    			},
					    	legend: {
					            display: true,
					            labels: {
					                fontSize: fontSz
					            	}
        						}
					    	}
					});
	
	// myLineChart.destroy();
}
