var http = require("http");
var url = require("url");
var fs = require("fs");
var path =require('path');
var mime = require('./mime.js').types; 
var config = {
	fileMatch: /^(gif|png|jpg|js|css)$/ig,
	maxAge: 60*60*24*365
}

http.createServer(function(req,res){
	let pathname = url.parse(req.url).pathname
	var realPath = path.join("public", pathname)
 
	fs.exists(realPath,function(exists){
		if (!exists) {
			res.writeHead(404,{'Content-Type':'text/plain'});
			res.end("This url "+pathname+"was not found");
		}else{
			var ext = path.extname(realPath);
			var contentType = mime[ext]?mime[ext]:'text/plain';
			res.setHeader('Content-Type',contentType);
			fs.stat(realPath, function (err, stat) {
			    var lastModified = stat.mtime.toUTCString();
			    var ifModifiedSince = "If-Modified-Since".toLowerCase();
			    res.setHeader("Last-Modified", lastModified);

			    if (ext.match(config.fileMatch)) {
			    	var expires = new Date();
			    	expires.setTime(expires.getTime() + config.maxAge * 1000);
			    	res.setHeader("Expires", expires.toUTCString());
			    	res.setHeader("Cache-Control", "max-age=" + config.maxAge);
			    }

			    if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
			        res.writeHead(304, "Not Modified");
			        res.end();
			    }else{
			    	var abc = fs.createReadStream(realPath);
			    	res.writeHead(200,"Ok");
			    	abc.pipe(res);
			    	// res.end();
			    	 // fs.readFile(realPath, function(err, file) {
         //               if (err) {
         //                   res.writeHead(500, "Internal Server Error", {'Content-Type': 'text/plain'});
         //                   res.end(err);
         //               } else {
         //                   res.writeHead(200, "Ok");
         //                   res.write(file);
         //                   res.end();
         //               }
         //          	 });
			    	
			    }
			});		
		}
	})
}).listen(3000);
console.log("server is started on port 3000");
