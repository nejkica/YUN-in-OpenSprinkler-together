var pcas=Date.now();
var cas=Date.now();
var delta=0;

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
	setTimeout("casSpremembe()", 1000);
}

function Spremeni(){
	nocache = "&nocache=" + Math.random() * 1000000;
	var request = new XMLHttpRequest();
	request.onreadystatechange = function()
	{
		if (this.readyState == 4) {
			if (this.status == 200) {
				if (this.responseText != null) {
					pcas=cas;
					d=Number(this.responseText);
					procent=d*100/1024;
					procent=Math.round(procent);
					narisiCanvas(procent);
					document.getElementById("visina").innerHTML = procent+"%";
					//document.getElementById("casSpremembe").innerHTML = procent+"%";
				}
			}
		}
	};
	request.open("GET", "ajaxtle" + nocache, true);
	request.send(null);
	setTimeout("Spremeni()", 1000);
}