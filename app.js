var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	routes = require('./routes'),
	_ = require('underscore'),
	workers = require('./workers'),
	moment = require('moment');
server.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080);


app.use(express.json());
app.use(express.urlencoded());

app.set('view engine', 'html');
app.engine('html', require('consolidate').underscore);

workers.fetchFeed();
setInterval(workers.fetchFeed, 300000);

function getFeed() {
	return workers.parsedFeed;
}

var routes = {}
routes.main = function(request, response) {
	response.render('index', {
		feed: getFeed(),
		moment: moment
	});
}

app.get('/', routes.main);