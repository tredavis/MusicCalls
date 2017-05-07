var express = require('express');
var router = express.Router();
var LastFmApi = require('../lfm.js')
var request = require('request');

//global keys
var apiKey = '1f579ca816d811e1c3f9578a27be8057';
var userName = 'montredavis';


var LastFMData = {
	userRecentTracks : []
}

function responseCallBack(err, res, body){
	console.log('inside callback')
	if(typeof body === 'undefined' || body === null){
		console.log(err);
		console.log(res.statusCode);
		return false;
	}
	else{

		var parsedData = JSON.parse(body); 
		LastFMData.userRecentTracks = parsedData.recenttracks;
	}

	console.log(LastFMData);
}

/**
 * [getRequest wraps a get http request]
 * @param  {[type]}   path     [the url to go to]
 * @param  {Function} callback [the call back function]
 * @return {[type]}            [null]
 */
function getRequest(path, callback) {
    request.get(path, callback);
}



router.get('/', function(req, res, next) {
    res.render('lastfm', { title: 'Last FM' });

    var userRecentTracks = getRequest(LastFmApi.userRecentTracks(userName, apiKey), responseCallBack);

});




module.exports = router;
