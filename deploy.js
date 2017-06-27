var pug = require("pug")
var fs = require("fs");
var readline = require('readline');
var baseDir = "./src/tilets";
var http = require("http");
var querystring = require("querystring");
var arr = [];
var URL = require("url");
console.log("building templates using pug...");
fs.readdirSync(baseDir).forEach(
    function(a){
        var p = baseDir + "/" + a;
        if(fs.statSync(p).isDirectory()){
            // read it out
            if(fs.existsSync(p + "/tmpl.pug")){
                var fn = pug.compileFileClient(p + "/tmpl.pug",{"name":a,inlineRuntimeFunctions:false});
                arr.push(a);
                arr.push(fn);
            }else console.log("missing " + a + "template pug!");
        }
    }
);
if(arr.length > 1){
    console.log("publishing templates...");
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      deDupeHistory:true,
      terminal: false
    });
    var url = "http://www.bizof.me";
    var code = "g0SFQA12320177102";
    var rurl = null;
    console.log("please provide deploy url["+url+"]:");

    rl.on('line', function (cmd) {
        if(rurl == null){
            if(cmd && cmd.length > 0){
                rurl = cmd;
            }else rurl = url;
            rurl += "/base.aspx";
            console.log("please provide deploy code:");
        
        }else{
            if(cmd && cmd.length > 0)code = cmd;
            rl.close();
            sendData(code,rurl);
        }
    });
    
    
}else{
    console.log("skippping publish since no template generated!");
}


function sendData(code,rurl){
    var actionData = {headers: ["deploy:" + code],strs:[_pack(arr)]};
    // start to send the request
    var postData = querystring.stringify({
        "a" : "getlast",
        "p" : "",
        "i" : _packObj(actionData),
        "r" : "false"
        });
    var u = URL.parse(rurl);
    var options = {
      hostname: u.hostname,
      port: u.port,
      protocol:u.protocol,
      path: u.path,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    };
    var req = http.request(options, (res) => {
      res.on('data', (chunk) => {
          var obj = _getObj(chunk.toString());
            if(!obj)console.log("invalid server response");
            else{
                if(obj.err)console.log("server error: " + obj.err +" failed to update");
                else console.log("publish successfully!!!");
            }
         
      });
      res.on('end', () => {
        
      });
    });
    console.log("sending template data to publish against " + rurl);
    req.write(postData);
    req.end();
    
}

function _unpack(Value){if(typeof Value != "string" || Value.length < 1)return null; var len = Value.length; if(len < 2)return null;
	var pos = 0, ret = [], segLen = 0, startPos = 0;
	while(pos < len - 1){// try to get the next index
		segLen = Value.indexOf(":",pos); if(segLen <= pos)break;startPos = segLen + 1;  segLen = parseInt(Value.substr(pos, segLen - pos));
		if(segLen >= 0 && startPos + segLen <= len){ ret.push(Value.substr(startPos,segLen)); pos = startPos + segLen; }
		else if(segLen == -1){ret.push(null);pos = startPos;}
		else break;}
	if(pos != len || ret.length < 1)return null;
	return ret;}
function _pack(arr){
	if(!arr || !(arr.length > 0))return "";
	var arr2 = [];
	for(var i = 0; i < arr.length;i++){
		if(typeof arr[i] == "undefined" || arr[i] == null)arr2.push("-1:");
		else { if(typeof arr[i] != "string")arr[i] = arr[i].toString(); if(!(arr[i].length > 0))arr[i] = ""; arr2.push(arr[i].length  + ":" + arr[i]);}
	}
	return arr2.join("");}
function _getObj(val){
	var ret = {str:null,err:null,headers:null,strs:null};
	if(val.substring(0,1) == "|"){ ret.strs = val.substring(1).split("|"); ret.headers = ret.strs;// for temp
		return ret;}
	else if(val.substring(0,1) != "#"){
		if(val.substring(0,1) == "@")ret.str = val.substring(1);
		else ret.str = val;
		return ret;}
	var arr = _unpack(val.substring(1));
	if(arr== null || arr.length != 4)return null;
	var ret = {};ret.str = arr[0];ret.err = arr[3];ret.headers = _unpack(arr[2]);ret.strs = _unpack(arr[1]);
	return ret;}
function _packObj(obj){
	var arr = [];arr.push(obj.str || null);arr.push(_pack(obj.strs));arr.push(_pack(obj.headers));arr.push(obj.err || null);
	return "#" + _pack(arr);}