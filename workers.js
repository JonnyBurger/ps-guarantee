var request = require('request'),
	xml2js = require('xml2js'),
	_ = require('underscore'),
	parser = new xml2js.Parser();


exports.fetchFeed = function () {
	request('http://www.pokerstars.com/datafeed/tournaments/satellite.xml', function (error, response, body) {
		if (error || response.statusCode != 200) return;
		var json = parser.parseString(body, function (err, result) {
			exports.lastFeed = result.selected_tournaments.tournament;
			exports.parsedFeed = exports.parseFeed();
			var nextupdate = result.selected_tournaments.$.next_update;
			console.log(parseInt(nextupdate)*1000/2)
			setTimeout(exports.fetchFeed, parseInt(nextupdate)*1000/2);
		});
	});
}

exports.parsePrizePool = function(prizepool) {
	if (prizepool.match(/\$/) || prizepool.match(/\$/) || prizepool.match(/\£/) ) {
		return parseFloat(prizepool.substr(1).replace(/,/g, ''));
	}
	if (prizepool.match(/FPP/)) {
		return parseInt(prizepool)/100;
	}
	return false;
}

exports.parseCurrency = function(prizepool) {
	if (prizepool.match(/\$/)) return '$';
	if (prizepool.match(/\€/)) return '€';
	if (prizepool.match(/\£/)) return '£';
	if (prizepool.match(/FPP/)) return '$';
	return false;
}

exports.parseBuyin = function(buy_in_amount, fpp_fee) {
	return parseFloat(buy_in_amount) + parseInt(fpp_fee)/100;
}


exports.parseFeed = function() {
	var feed = exports.lastFeed;
	var feed = _.map(feed, function (t) {
		var tournament = t;
		var obj = {}
		obj.prizepool = tournament.prize == "" ? 0 : exports.parsePrizePool(tournament.$.prize);
		if (!obj.prizepool) return null;

		obj.currency = exports.parseCurrency(tournament.$.prize);
		if (!obj.currency) return null;

		obj.buyin_label = tournament.buy_in_fee[0];
		obj.buyin = exports.parseBuyin(tournament.buy_in_amount[0], tournament.fpp_fee[0]);

		obj.players = parseInt(tournament.$.players);
		obj.prizes_by_players = parseInt(tournament.$.players)*obj.buyin; 

		obj.guarantee = !!tournament.$.guaranteed;

		obj.name = tournament.name[0];

		obj.id = tournament.$.id;

		obj.is_satellite = tournament.$.parent_id ? tournament.$.parent_id : false;

		obj.added_by_ps = obj.prizepool - obj.prizes_by_players;
		obj.added_by_ps = obj.added_by_ps <= 0 ? 0 : Math.round(obj.added_by_ps*100)/100;

		obj.starts = tournament.start_date[0];
		return obj;
	});
	var feed = _.compact(feed);
	return feed;
}

exports.parsedFeed = null;
exports.lastFeed = null;