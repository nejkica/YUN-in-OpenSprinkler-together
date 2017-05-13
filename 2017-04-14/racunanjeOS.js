var os = require('./branjeOS.js');
var sprPostajo = require('./sprPostajo.js');
var brPython = require('./branjePyLPF.js');
var napakaSonde = require('./napakaSondeReboot.js');
//var heapdump = require('/root/heapdump/heapdump.js');

var posTrenutniCas = 0;
var casOsvezevanja = 5000; //ms
var konzolnoSporocilo = "";
var stevecNapak = 0;
var m3Vode = 10;

Date.prototype.toLocaleDateString = function () { //da imamo leading zero v formatu datuma v log fajlu in potem na spletnem vmesniku
	var gm = this.getMonth() + 1;
	if (gm.toString().length == 1) gm = '0' + gm;

	return this.getFullYear() + '-' + gm + '-' + this.getDate();
};
//var heap = setInterval(heapdump.writeSnapshot('/var/local/' + Date.now() + '.heapsnapshot'), 60000);
//console.log('Datum\tm3 kapljicno\tm3 trata\tset point\tkolicina v rezervoarju\todstopanje\tventil');

var periodaF = function(){
	var pV = podatki(); //podatki.pd so OS programcki
	var prog = programiDanes(pV.osTrenutniCas, pV); //matrika programov, ki se bo izvajala danes
	var startiProgramov = []; //matrika startov za te programe zgoraj
	var trajProg = [];

	var pretok = [1.0, 1.82376]; // m3/h - prvi je kapljični, drugi je trata (izmerjeno 0,5066 l/s)
	var Vmin = 0.9; // m3 -> to je 200 mm višine gladine
	var Vdelta = 0.15; // m3, to je 5,76 cm -> razlika v višini - s to delto se regulira nihanje oz pogostost vklapljanja ventila za vodo
//------------------------------------------------------------------------------------
	var Vmax = 8.7; // m3 -> max dinamični je 9.836442 m3. Max statični je 8.9,  8.7 pa je ca 200 litrov pred prelivanjem v ponikovalnico, kar je ca 4,6 cm. skala je približno 43,428 l/cm višine.
//------------------------------------------------------------------------------------
	//var ka = 818/Vmax; //linearna funkcija

	//-------------------------------------------------------------------------------------------
	var povrsina = 4.3428; // v m2 - preračunano glede na dimenzije zalogovnika: 1540x2820 mm 
	var hVodeMax = (Vmax / povrsina).toFixed(4);
	var hVodePy = (Number(brPython.pyPreberi)).toFixed(4); // preberemo s python scriptom analog0 na arduinu in dobimo m3
	if (isNaN(hVodePy) || (hVodePy>= Vmax)) hVodePy = hVodeMax; // max visina
	
	if (hVodePy <= 0) { //če sonda javlja 0, potem je napaka. Ker branjePython.js že sam nekaj računa, to da vrednost -2.45
		stevecNapak += 1;
		if (stevecNapak > 5) {
			napakaSonde.reboot();
		}
	} else {
		stevecNapak = 0;
		m3Vode = (Number(hVodePy*povrsina)).toFixed(2); // toliko m3 vode je trenutno v zalogovniku
	}


	//-------------------------------------------------------------------------------------------
	//console.log('\033[2C');
	//console.log(pV.osTrenutniCas);
	//var m3Vode = (hVodePy - 205)/ka;

	for (var i = 0; i < prog.length; i++) {
		startiProgramov.push(startiPrograma(prog[i], pV));
		trajProg.push([trajanjePrograma(prog[i], pV.pd).trajanjeMS0, trajanjePrograma(prog[i], pV.pd).trajanjeMS1]);
	}

	// var dc = new Date(pV.osTrenutniCas);
	// var dcOffset = dc.getTimezoneOffset();
	// var dcn = new Date(pV.osTrenutniCas + dcOffset*60*1000);

	var datum = new Date();

	// var msDatum = datum.getTime() - min2ms(60);
	// var dSistem = new Date(msDatum);
	//dSistem = dSistem + dSistem.getTimezoneOffset();
	//console.log('\n' + dcn);
	konzolnoSporocilo = datum.toLocaleDateString() + ' ' + datum.toLocaleTimeString();
	dc = null;
	dcn = null;

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	var arrSetp = izracunajSPVol(prog, startiProgramov, trajProg, pretok);
	var setP = Number(arrSetp.setPV0) + Number(arrSetp.setPV1) + Vmin;
	
	setP = setP.toFixed(2);
	

	if (setP >= Vmax) setP = Vmax; // da ne bi bil set point višji od preliva
	else if (setP <= Vmin) setP = Vmin; // da ne bi bil set point nižji od minimalne potopljenosti črpalke

	var napaka = (setP - m3Vode).toFixed(2);


	konzolnoSporocilo = konzolnoSporocilo + '\t' + setP + '\t' + m3Vode;
	konzolnoSporocilo = konzolnoSporocilo + '\t' + napaka;
	
	if (napaka > Vdelta){ //če delta premajhen, potem ne delaj sprememb.
		if((pV.vvD === 0) && (pV.zakasnitevPadavine === 0)){ //odpri ventil samo če je postaja oz izhod na OS omogočen.
			sprPostajo.odpriVentil();//odpri ventil
			konzolnoSporocilo = konzolnoSporocilo + '\t1';
		} else {
			konzolnoSporocilo = konzolnoSporocilo + '\t-1';
		}
	} else if (napaka <= 0){ //kadar je delta v minus, pomeni, da je vode preveč, samo zapri ventil
		sprPostajo.zapriVentil();//zapri ventil
		konzolnoSporocilo = konzolnoSporocilo + '\t0';
	} else { //kadar je delta premajhen ampak še vedno pozitiven ... samo sporoči, da program ne spreminja nič - -0 je vrednostv log fajlu
		konzolnoSporocilo = konzolnoSporocilo + '\t-0';
	}

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	console.log(konzolnoSporocilo);
	konzolnoSporocilo = '';
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

		if (Math.max.apply(null, stProgramov[i]) == -1) continue; //preskoči, če je -1, ker to pomeni, da je start mimo
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
	//console.log("\r\t" + setPV0 + '\tm3 kapljično\t' + setPV1 + '\tm3 trata');
	konzolnoSporocilo = konzolnoSporocilo + '\t' + setPV0 + '\t' + setPV1;

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

var startiPrograma = function(zapProgram, pdtk){ // damo mu izbrani program in potegne ven matriko startov za današnji dan
	var pdV = pdtk;
	pd = pdV.pd;
	var zastavica = pd[zapProgram][0];
	var doZacetkaPrograma=[];

	if ((zastavica & 64) > 0) { // če je 6. bit določen (1), potem gre za fiksne čase in so največ štirje
		var matrikaStartov = pd[zapProgram][3]; 
		//matrikaStartov.sort(); //sortiramo od najkrajšega do najdaljšega
		
		for (var i = 0; i < 4; i++) {
			if(matrikaStartov[i]<=0) continue;
			else {
				doZacetkaPrograma.push(razvozlajStart(matrikaStartov[i], pdV));
			}
		}
	} else if ((zastavica & 64) == 0) { //bit 6 je 0
		var matrikaNastavitev = pd[zapProgram][3];
		var racunskiStart=matrikaNastavitev[0];
		var ponovitev = matrikaNastavitev[1];
		var interval = matrikaNastavitev[2];
		
		var prviStart = razvozlajStart(racunskiStart, pdV);

		doZacetkaPrograma.push(prviStart);

		
		for (var i = 1; i < ponovitev+1; i++) {
			var start = racunskiStart + i * interval;
			var startMS = razvozlajStart(start, pdV);
			doZacetkaPrograma.push(startMS);
		}

	}

	doZacetkaPrograma.sort(function(a, b){
			return a-b;
			}
		);

	return doZacetkaPrograma;

};


var razvozlajStart = function(startA, pod){ // po API priročniku posamezni biti v start0, start1, start2, start3 nekaj pomenijo. Ta jih razvozla in vrne čas začetka v ms od zdaj
	var pV = pod;
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

var programiDanes = function (tc, pdt){ //ko to pokličemo damo za argument trenuten čas. In v tem dnevu poišče programe, ki imajo plan odpirat vetile

	var zacetkiDanes=[];
	var pV = pdt;
	var pd = pV.pd;
	var stProg = pd.lenght;
	var danes = danVtednu(tc); //dobimo dan v tednu 1 -ponedeljek, 2 -torek ... 0- nedelja
	var datumDan = danDatum(tc);
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

var podatki = function (){ //funkcija potegne podatke iz os.obj, ki ga vrne ./branjeOS.js (bere odziv URL-ja od vseh opcij OpenSprinklerja -?ja&pw=xxx )

	var osTrenutniCas = os.obj.settings.devt*1000;

	var osSunRise = min2ms(os.obj.settings.sunrise); //krmilnik daje info v minutah po polnoči
	var osSunSet = min2ms(os.obj.settings.sunset);
	var msOdPolnociV = msOdPolnoci(osTrenutniCas);
	var koracno = os.obj.stations.stn_seq; //127 če so vklopljeni vsi kanali na sekvenčno - pomeni, da se nihkoli ne prekrivajo
	var zakasnitevPadavine = os.obj.settings.rd;

	if (koracno > 0) {
		if ((osTrenutniCas - posTrenutniCas)>0) {
			sprPostajo.spremeniKorake();
			//console.log('+++++++++++++++++++++ koraki ponastavljeni na 0 ++++++++++++++++++');
			posTrenutniCas=osTrenutniCas;
		}
	}

	var dezZakasnitevAktiven = os.obj.settings.rd;
	var pd = os.obj.programs.pd;
	var ventilVodovodaDisabled = os.obj.stations.stn_dis;
	var vvD = (ventilVodovodaDisabled & 64) >> 6;
	//console.log('ventilVodovodaDisabled ' + ventilVodovodaDisabled + ' ' + vvD);

	return {
		osTrenutniCas: osTrenutniCas, 
		osSunRise: osSunRise, 
		osSunSet: osSunSet, 
		msOdPolnociV: msOdPolnociV,
		dezZakasnitevAktiven: dezZakasnitevAktiven,
		pd: pd,
		vvD: vvD,
		zakasnitevPadavine: zakasnitevPadavine
	};

};


module.exports.perioda=perioda; //zato da lahko prekinem setInterval s clearInterval(xxx.perioda)

function danVtednu(unixTime){
	var d = new Date(unixTime); 
	var n = d.getDay();
	d=null;
	return n;
}

function danDatum(unixTime){
	var d = new Date(unixTime); 
	var n = d.getDate();
	d=null;
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
	d=null;
	return ms;

}

function isEven(n) { //vrne, če je liha številka
  return n == parseFloat(n)? !(n%2) : void 0;
}