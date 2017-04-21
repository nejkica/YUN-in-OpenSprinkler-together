var os = require(['branjeOS-s.js']);
var sprPostajo = require(['sprPostajo-s.js']);
var brPython = require(['branjePython-s.js']);
//var heapdump = require('/root/heapdump/heapdump.js');

var posTrenutniCas = 0;
var casOsvezevanja = 5000; //ms

//var heap = setInterval(heapdump.writeSnapshot('/var/local/' + Date.now() + '.heapsnapshot'), 60000);


var periodaF = function(){
	var pV = podatki(); //podatki.pd so OS programcki
	var prog = programiDanes(pV.osTrenutniCas); //matrika programov, ki se bo izvajala danes
	var startiProgramov = []; //matrika startov za te programe zgoraj
	var trajProg = [];

	var pretok = [2.5, 1.5]; // m3/h
	var Vmin = 0.75; // m3 -> to je 205,9 mm višine
	var Vdelta = 0.04 // m3 -> razlika v višini - s to delto se regulira nihanje oz pogostost vklapljanja ventila za vodo
	var Vmax = 8.3; // m3 -> to je ca 60 litrov pred prelivanjem v ponikovalnico 

	//-------------------------------------------------------------------------------------------
	var locljivost = 0.008181055; // v m3/dec - preračunano glede na dimenzije zalogovnika: 1550x2350 mm x h=2300 mm
	var hVodePy = (Number(brPython.pyPreberi)).toFixed(2); // preberemo s python scriptom analog0 na arduinu in dobimo surovo vrednost 0-1024
	if (isNaN(hVodePy)) hVodePy = Vmax;

	var m3Vode = (Number(hVodePy*locljivost)).toFixed(2); // toliko m3 vode je trenutno v zalogovniku
	//-------------------------------------------------------------------------------------------
	//console.log('\033[2C');
	//console.log(pV.osTrenutniCas);
	

	for (var i = 0; i < prog.length; i++) {
		startiProgramov.push(startiPrograma(prog[i]));
		trajProg.push([trajanjePrograma(prog[i], pV.pd).trajanjeMS0, trajanjePrograma(prog[i], pV.pd).trajanjeMS1]);
	}

	//console.log(prog);
	//console.log(startiProgramov);
	//console.log(trajProg);

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	var arrSetp = izracunajSPVol(prog, startiProgramov, trajProg, pretok);
	var setP = Number(arrSetp.setPV0) + Number(arrSetp.setPV1);
	
	setP = setP.toFixed(2);
	

	if (setP >= Vmax) setP = Vmax; // da ne bi bil set point višji od preliva
	else if (setP <= Vmin) setP = Vmin; // da ne bi bil set point nižji od minimalne potopljenosti črpalke

	var napaka = (setP - m3Vode).toFixed(2);
	console.log('set point = ' + setP + '; Vode v rezervoarju je ' + m3Vode);

	console.log(napaka + ' je napake');

	if (napaka > Vdelta){
		sprPostajo.odpriVentil();//odpri ventil
	} else if (napaka <= 0){
		sprPostajo.zapriVentil();//zapri ventil
	} else {
		
	}

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

};

var perioda = setInterval (periodaF, casOsvezevanja);


var izracunajSPVol = function(aktuProgrami, stProgramov, trajProgramov, qju){
	var zac = 0; 		// začetek trenutnega programa (zadnjega zagona danes)
	var nZac0 = 0; 		// začetek navideznega programa zadnjega zagona danes
	//var zac1 = 0; 	// začetek trenutnega programa (zadnjega zagona danes)
	var nZac1 = 0; 		// začetek navideznega programa zadnjega zagona danes
	var kon0 = 0; 		// konec -//-
	var nKon0 = 0; 		// konec navideznega -//-
	var kon1 = 0; 		// konec -//-
	var nKon1 = 0; 		// konec navideznega -//-

	for (var i = 0; i < aktuProgrami.length; i++) {
		zac = (Math.max.apply(null, stProgramov[i]))/1000;
		kon0 = zac + trajProgramov[i][0];
		kon1 = zac + trajProgramov[i][1];

		//console.log(zac + ' ' + kon0 + ' ' + kon1);

		if (zac > nKon0) {
			nZac0 = zac;
		}

		if (zac > nKon1) {
			nZac1 = zac;
		}

		if (kon0 > nKon0) {
			nKon0=kon0;
		}

		if (kon1 > nKon1) {
			nKon1=kon1;
		}

	}

	var setPV0 = ((nKon0 - nZac0)/3600*qju[0]).toFixed(2);
	var setPV1 = ((nKon1 - nZac1)/3600*qju[1]).toFixed(2);
	//console.log('začetek0 čez ' + nZac0 + '; začetek1 čez ' + nZac1);
	//console.log('konec 0 čez ' + nKon0 + ', konec 1 čez ' + nKon1);
	console.log(setPV0 + ' m3; ' + setPV1 + ' m3');


	return {
		setPV0: setPV0,
		setPV1: setPV1
	};

};

var trajanjePrograma = function(zapProg, pVpd) {
	//var pV = podatki();
	var pd = pVpd;

	var durMat = pd[zapProg][4]; //matrika s trajanji
	var trajanjeMS0 = durMat[0]; //trajanje za prvi izhod (S0) v s
	var trajanjeMS1 = durMat[1]; //trajanje za drugi izhod (S1) v s


	return {
		trajanjeMS0: trajanjeMS0,
		trajanjeMS1: trajanjeMS1
	};
};
//unix time je v s, zato *1000, da dobimo ms

var startiPrograma = function(zapProgram){ // damo mu izbrani program in potegne ven matriko startov za današnji dan
	var pdV = podatki();
	pd = pdV.pd;
	var zastavica = pd[zapProgram][0];
	var doZacetkaPrograma=[];

	if ((zastavica & 64) > 0) { // če je 6. bit določen (1), potem gre za fiksne čase in so največ štirje
		var matrikaStartov = pd[zapProgram][3]; 
		//matrikaStartov.sort(); //sortiramo od najkrajšega do najdaljšega
		
		for (var i = 0; i < 4; i++) {
			if(matrikaStartov[i]<=0) continue;
			else {
				doZacetkaPrograma.push(razvozlajStart(matrikaStartov[i]));
			}
		}
	} else if ((zastavica & 64) == 0) { //bit 6 je 0
		var matrikaNastavitev = pd[zapProgram][3];
		var racunskiStart=matrikaNastavitev[0];
		var ponovitev = matrikaNastavitev[1];
		var interval = matrikaNastavitev[2];
		
		var prviStart = razvozlajStart(racunskiStart);

		doZacetkaPrograma.push(prviStart);

		
		for (var i = 1; i < ponovitev+1; i++) {
			var start = racunskiStart + i * interval;
			var startMS = razvozlajStart(start);
			doZacetkaPrograma.push(startMS);
		}

	}

	doZacetkaPrograma.sort(function(a, b){return a-b});

	return doZacetkaPrograma;

};


var razvozlajStart = function(startA){ // po API priročniku posamezni biti v start0, start1, start2, start3 nekaj pomenijo. Ta jih razvozla in vrne čas začetka v ms od zdaj
	var pV = podatki();
	var start = startA;
	var doZacetka = -1;

	var b12=(start&4096)>>12; //znak + ali - (minus, če je ena)
	var b13=(start&8192)>>13; // če je ena, potem je sunset izhodišče
	var b14=(start&16384)>>14; // če je ena, potem je sunrise izhodišče

	var startMS = min2ms(start&4095); //v ms - najprej pa vzamemo samo zadnjih 11 bitov

	if ((b13==0) && (b14==0)){ //bit 13 in 14 sta 0, torej štejemo od polnoči
		doZacetka=startMS-pV.msOdPolnociV;
		if (doZacetka<=0) doZacetka=-1;

	} else if ((b13==1) && (b14==0)) { //sunset je izhodišče
		if (b12==0) doZacetka=pV.osSunSet+startMS-pV.msOdPolnociV;
		else if (b12==1) doZacetka=pV.osSunSet-startMS-pV.msOdPolnociV;

		if (doZacetka<=0) doZacetka=-1;

	} else if ((b13==0) && (b14==1)){ //sunrise je izhodišče
		if (b12==0) doZacetka=pV.osSunRise+startMS-pV.msOdPolnociV;
		else if (b12==1) doZacetka=pV.osSunRise-startMS-pV.msOdPolnociV;

		if (doZacetka<=0) doZacetka=-1;
	}

	return doZacetka;

};

var programiDanes = function (tc){ //ko to pokličemo damo za argument trenuten čas. In v tem dnevu poišče programe, ki imajo plan odpirat vetile

	var zacetkiDanes=[];
	var pV = podatki();
	var pd = pV.pd;
	var stProg = pd.lenght;
	var danes = danVtednu(tc); //dobimo dan v tednu 1 -ponedeljek, 2 -torek ... 0- nedelja
	var datumDan = danDatum(tc)
	var sodDan = isEven(datumDan); //dobimo true za lih dan in false za sod dan
	var lihSodOmejitev = 0; //0 - ni omejitve, 1- omejeni sodi, 2- omejeni lihi dnevi
	var danesB = -1;

// lihSodOmejitev 1 ali 2 ali 0
//1 - dovoljeni neparni dnevi
//2 - dovoljeni parni dnevi


	if (danes!=0) { danesB = 1<<(danes-1);} else {danesB=danes;} //naredimo bitno masko za preverjanje
	
	for (var i = 0; i < pd.length; i++) { //gremo čez vsak program
		var zastavica = pd[i][0]; //dobi zastavo
		lihSodOmejitev=(zastavica&12)>>2;

		//console.log('--------omejitev--------' + lihSodOmejitev + '-------sodDan-------' + sodDan);

		if ((zastavica&1) != 1) continue; // če program ni aktiven, potem pojdi na naslednjo iteracijo
		
		if ((((zastavica&2)>>1) == 1) && pV.dezZakasnitevAktiven==1) continue; //če je dež in program upošteva dež, pojdi mimo
		
		if ((lihSodOmejitev==1 && sodDan==true) || (lihSodOmejitev==2 && sodDan==false)) continue; //če je omejitev na sode ali lihe dni, pojdi mimo, če je omejen
		//console.log('--------lihSodOmejitev-------- ' + lihSodOmejitev + ' -------pV.dezZakasnitevAktiven------- ' + pV.dezZakasnitevAktiven + ' ++++++++++++++ sodDan ++++++++++++++++ ' + sodDan);
		if ((zastavica&48)>>4 == 0){ //če program določa dneve v tednu (ponedeljek, sreda ...)
			var d0=pd[i][1]; // dnevi po bitih v OS za ta program
			var d0b= d0 & 64;
			
			if (((d0 & danesB) > 0) || ((d0b==64) && (danesB==0))){	//danes se dogaja (zaradi nedelje je danesB=0, zato dodaten pogoj)
				zacetkiDanes.push(i); //delamo array danes aktivnih programov
			} else continue;
		} else if ((zastavica&48)>>4 == 3){ //če program določa intervalne dneve -npr vsak 3. dan
			var d0=pd[i][1]; // preostanek dni do izvajanja programa (0 pomeni danes)
			//var d1=pd[i][2]; // interval npr vsake 3 dni
			if (d0 == 0){	//danes se dogaja
				//zacetkiDanes=zacetkiDanes | (1<<i); //delamo masko po bitih kateri programi se začnejo danes
				zacetkiDanes.push(i);
			} else continue;
		}

	}
	

	return zacetkiDanes;

};

var podatki = function (){ //funkcija potegne podatke iz os.obj, ki ga vrne[ branjeOS.js (bere odziv URL-ja od vseh opcij OpenSprinklerja -?ja&pw=xxx )

	var osTrenutniCas = os.obj.settings.devt*1000;

	var osSunRise = min2ms(os.obj.settings.sunrise); //krmilnik daje info v minutah po polnoči
	var osSunSet = min2ms(os.obj.settings.sunset);
	var msOdPolnociV = msOdPolnoci(osTrenutniCas);
	var koracno = os.obj.stations.stn_seq; //127 če so vklopljeni vsi kanali na sekvenčno - pomeni, da se nihkoli ne prekrivajo
	if (koracno > 0) {
		if ((osTrenutniCas - posTrenutniCas)>0) {
			sprPostajo.spremeniKorake();
			//console.log('+++++++++++++++++++++ koraki ponastavljeni na 0 ++++++++++++++++++');
			posTrenutniCas=osTrenutniCas;
		}
	}

	var dezZakasnitevAktiven = os.obj.settings.rd;
	var pd = os.obj.programs.pd;


	return {
		osTrenutniCas: osTrenutniCas, 
		osSunRise: osSunRise, 
		osSunSet: osSunSet, 
		msOdPolnociV: msOdPolnociV,
		dezZakasnitevAktiven: dezZakasnitevAktiven,
		pd: pd
	};

};


//module.exports.perioda=perioda; //zato da lahko prekinem setInterval s clearInterval(xxx.perioda)

function danVtednu(unixTime){
	var d = new Date(unixTime); 
	var n = d.getDay();
	return n;
}

function danDatum(unixTime){
	var d = new Date(unixTime); 
	var n = d.getDate();
	return n;
}

function min2ms(minute){
	var ms = 0;
	ms = minute*60*1000;
	return ms;
}

function msOdPolnoci(trenutniCas){ // za argument damo trenutni čas in vrne ms od polnoči.
	var d = new Date(trenutniCas);
	var ms = d.getTime()+ min2ms(d.getTimezoneOffset()) - d.setHours(0,0,0,0);

	return ms;

}

function isEven(n) { //vrne, če je liha številka
  return n == parseFloat(n)? !(n%2) : void 0;
}