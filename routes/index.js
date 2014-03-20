var _ = require('underscore');

exports.main = function(request, response) {
	response.render('index', {
		feed: getFeed()
	});
}