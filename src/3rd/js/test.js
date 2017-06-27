var _sim_no_debug = true; // disable localhost
function prepare(a){
	// step 1, 
	a.inputSpec = checkSpec(a.inputSpec);
	for(var s in a.commands){
		a.commands[s].inputSpec = checkSpec(a.commands[s].inputSpec);
		if((a.commands[s].flag & 32) != 0 && a.defaultCommand == null)a.defaultCommand = s;
	}
	return a;
}

function checkSpec(str){
	if(!str)return [];
	var spec = [];
  var arr = str.split("\n");
 for(var c = 0; c < arr.length;c++){
	var pos = arr[c].indexOf("=");
	if(pos <= 0)continue;
	spec.push(arr[c].substring(0,pos));
	var pos2 = arr[c].indexOf("|",pos);
	if(pos2<0) pos2 = arr[c].length;
	 spec.push(arr[c].substring(pos+1,pos2));
	 if(pos2 >= arr[c].length)pos2 -= 1;
	 spec.push(arr[c].substring(pos2+1)); 
  }
 return spec;
}

var loadedFiles = 0;
function loadshit(f){
    loadedFiles = f.files.length;
	for(var i=0;i < f.files.length;i++){
	  loadfile(f.files[i]);
	}
}
function loadfile(f){
 var fname = f.name.split(".")[0]; // the tilet
 var reader = new FileReader();
  reader.onload = function(event) {
    var data = event.target.result;
	// pick up the stuff
	var p = data.substring(data.indexOf(",")+1);
	data = window.atob(p);
	// set into the tilets
	DP.g()[1](fname,data);
	//var k = "a=dop&p=loadtilet&i=" + encodeURIComponent(DP.packObj({strs:[fname],headers:["name"]})) + "&r=false";
	//var org = _sm_faker[k];
	//if(!org)return;
	//var ob = DP.getobj(org);
	//ob.strs[2] = data;
	//org = DP.packObj(ob);
	//_sm_faker[k] = org; // replace it
	if(--loadedFiles < 1){
	    initer.style.display = "none";
		l("loaduser",null); // initial the stuff
	}
  };
 
  reader.readAsDataURL(f);
}