var pcas=Date.now();
var cas=Date.now();
var delta=0;
var maxPosodobitev = 50;
var stPosodobitev = 0;

$('#naloziDodatno').hide();
$('#beloCezVse').hide();

function casSpremembe(){
	cas=Date.now();
	delta=(cas-pcas)/1000;
	document.getElementById("casSpremembe").innerHTML = Math.round(delta)+" s od zadnje spremembe";
	if (delta > 7) {
		document.getElementById("visina").style.color = "red";
	}
	else {
		document.getElementById("visina").style.color = "green";
	}
	var ponoviSekunde = setTimeout(function() {
			casSpremembe();
		}, 1000);
}

function Spremeni(){
	$('#naloziDodatno').hide();
	$('#beloCezVse').hide();

	stPosodobitev = stPosodobitev + 1;
	nocache = "&nocache=" + Math.random() * 1000000;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function()
	{
		if (this.readyState == 4) {
			if (this.status == 200) {
				if (this.responseText != null) {
					pcas=cas;
					d=Number(this.responseText);
					//console.log(d);
					procent=d*100/2.265;
					procent=Math.round(procent);

					if (procent > 0) {
						narisiCanvas(procent);
						$("#visina").innerHTML = procent+"%";
					} else {
						narisiCanvas(0);
						$("#visina").innerHTML = "sonda je v napaki - resetiraj omarico";
					}
					//document.getElementById("casSpremembe").innerHTML = procent+"%";
				}
			}
		}
	};
	request.open("GET", "ajaxtle" + nocache, true);
	request.send(null);
	if (stPosodobitev < maxPosodobitev){
		var ponoviSpremeni = setTimeout(function(){
				Spremeni();
			}, 3000);
	} else {
		$('#beloCezVse').show();
		$('#naloziDodatno').show();
		$('#naloziDodatno').on('click', function(){
			stPosodobitev = 0;
			Spremeni();
		});

	}
}