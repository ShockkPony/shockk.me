var fs = require('fs');
var http = require('http');
var url = require('url');

exports.start = function()
{
	this.content_types = {};
	this.handlers = {
		fallback: function(request, response, request_url, data)
		{
			response.write(data);
		}
	};

	this.start_date = new Date();

	this.server = http.createServer();
	console.log('[HTTP] created');

	this.server.listen(80);
	var addr = this.server.address();
	console.log('[HTTP] listening on ' + addr.address + ':' + addr.port);

	this.server.on('request', function(request, response)
	{
		var request_url = url.parse(request.url, true);
		console.log('[HTTP] request from ' + request.socket.remoteAddress + ' for ' + request_url.pathname);

		var path = (request_url.pathname !== '/') ? request_url.pathname : '/index.html';
		var parts = path.split('.');
		var ext = (parts.length > 1) ? parts[parts.length - 1] : 'html';
		var content_type = (this.content_types[ext] !== undefined) ? this.content_types[ext] : 'text/html';
		var route = (this.handlers[content_type] !== undefined) ? content_type : 'fallback';

		fs.readFile('./public' + path, function(err, data)
		{
			if(err)
			{
				console.log(err);
				response.statusCode = 404;
				response.setHeader('Content-Type', 'text/plain');
				response.write('404 Not Found');
				response.end();
			}
			else
			{
				response.statusCode = 200;
				response.setHeader('Content-Type', content_type);
				this.handlers[route](request, response, request_url, data.toString());
				response.end();
			}
		}.bind(this));
	}.bind(this));

	this.server.on('checkContinue', function(request, response)
	{
		response.writeHead(400);
		response.end();
		request.socket.end();
	}.bind(this));
}
