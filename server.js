// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
var gameboard = require('./makeBoard')


const ROOT = "./";
var users = {};



// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');


function handleRequest(req, res) {

	//process the request
	console.log(req.method+" request for: "+req.url);

	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	var data ="";
	//check pathname for post
	if (urlObj.pathname === "/memory/intro") {
		//check for error
		try{
			//posting data on serverSide
			req.on("data", function(chunk){
				data += chunk;
				var parsedData = JSON.parse(data);
				if (!users[parsedData.username]) {
					var newObj = {};
					newObj.name = parsedData.username;
					newObj.level = 4;
					newObj.myGame = gameboard.makeBoard(newObj.level);
					users[parsedData.username] = newObj;
					respond(200, JSON.stringify(newObj));

				}
				 else { 
					users[parsedData.username].level += 2;
					if (users[parsedData.username].level >= 10){
						users[parsedData.username].level = 10
					}
					users[parsedData.username].myGame = gameboard.makeBoard(users[parsedData.username].level);
					respond(200, JSON.stringify(users[parsedData.username]));
				}
			});
		}
		catch(err){
			respondErr();
		}
		req.on('end', function() {
			respond(200);
  		});
	}
	//if pathname matches pathname for get request
	else if (urlObj.pathname === "/memory/card"){
		//checking if invalid row or column entered
		try{
			var myCard = users[urlObj.query.username];
			var num = myCard.myGame[urlObj.query.row][urlObj.query.col];
			if(((myCard.myGame[urlObj.query.row].length) > (users[urlObj.query.username].level)) || ((myCard.myGame[urlObj.query.col].length) > (users[urlObj.query.username].level))) {
				throw(err);
			}
			else{	
				respond(200, JSON.stringify(num));
			}
		}
		catch(err){
			respondErr();
		}
	}
	// static server
	else {
	//the callback sequence for static serving...
		fs.stat(filename,function(err, stats){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr();
			}else{
				if(stats.isDirectory())	filename+="/index.html";
		
				fs.readFile(filename,"utf8",function(err, data){
					if(err)respondErr();
					else respond(200,data);
				});
			}
		});
	}
	//Error handeling function
	function respondErr(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
	//responding function
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}

}