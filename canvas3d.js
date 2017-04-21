function narisiCanvas(polnost){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var polnP = polnost;

	ctx.clearRect(0,0,c.width,c.height);
	ctx.save();
	//var width = c.width;
	//var height = c.height;

	var poln = 200*polnP/100;

	var crticeKooX=305;
	var crticeKooY=400;


	ctx.transform(1,0,0,1,20,-150);
	// cyan spredaj
	ctx.beginPath();
	//ctx.lineWidth="1";
	ctx.strokeStyle="cyan";
	ctx.rect(0,500-poln,200,poln);
	ctx.fillStyle = "cyan";
	ctx.fill(); 
	ctx.stroke();

	// cyan desno postrani
	ctx.beginPath();
	ctx.moveTo(200,500);
	ctx.lineTo(200,500-poln);
	ctx.lineTo(300,400-poln);
	ctx.lineTo(300,400);
	ctx.closePath();
	//ctx.lineWidth="1";
	ctx.strokeStyle="grey";
	ctx.fillStyle = "cyan";
	ctx.fill(); 
	ctx.stroke();

	// cyan zgornji postrani
	ctx.beginPath();
	ctx.moveTo(0,500-poln);
	ctx.lineTo(100,400-poln);
	ctx.lineTo(300,400-poln);
	ctx.lineTo(200,500-poln);
	ctx.closePath();
	//ctx.lineWidth="1";
	ctx.strokeStyle="grey";
	ctx.fillStyle = "#00baba";
	ctx.fill(); 
	ctx.stroke();



	ctx.beginPath();

	ctx.moveTo(0,500);
	ctx.lineTo(200,500);
	ctx.lineTo(200,300);
	ctx.lineTo(0,300);
	ctx.lineTo(0,500);

	ctx.moveTo(200,500);
	ctx.lineTo(300,400);
	ctx.lineTo(300,200);
	ctx.lineTo(200,300);

	ctx.moveTo(0,300);
	ctx.lineTo(100,200);
	ctx.lineTo(300,200);



	ctx.strokeStyle = '#000000';
	ctx.stroke();
	 

	ctx.beginPath();
	ctx.moveTo(100,200);
	ctx.lineTo(100,400);
	ctx.lineTo(300,400);
	ctx.moveTo(100,400);
	ctx.lineTo(000,500);
	ctx.strokeStyle = 'grey';
	ctx.stroke();

	ctx.beginPath();
	for (i=0; i<11; i++){
	  ctx.moveTo(crticeKooX+0,crticeKooY-200/10*i);
	  ctx.lineTo(crticeKooX+10,crticeKooY-200/10*i);
	  
	  
	}
	ctx.strokeStyle = 'black';
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(crticeKooX-5,crticeKooY-poln);
	ctx.lineTo(crticeKooX+10,crticeKooY-poln);
	ctx.strokeStyle = 'red';
	ctx.stroke();

	ctx.beginPath();
	ctx.lineTo(crticeKooX+20,crticeKooY-poln-5);
	ctx.lineTo(crticeKooX+20,crticeKooY-poln+5);
	ctx.lineTo(crticeKooX+10,crticeKooY-poln);
	ctx.fillStyle = "red";
	ctx.fill();
	ctx.strokeStyle = 'red';
	ctx.stroke();

	ctx.font = "18px Arial";
	ctx.fillText(polnP + " %",crticeKooX+25,crticeKooY-poln+5);

	ctx.restore();
}

narisiCanvas(0);