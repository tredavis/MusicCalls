"use strict"

let express = require('express');
let router = express.Router();
let LastFmApi = require('../lfm.js')
let request = require('request');

//global keys
let apiKey = '1f579ca816d811e1c3f9578a27be8057';
let userName = 'montredavis';

/**
 * [LastFMData description]
 * @type {Object}
 */
var LastFMData = {
	userRecentTracks : []
}

/**
 * [LastFmObject description]
 */
function LastFmObject(){
	this.tracks = [],
	this.artists = [];
	this.pageMax = 0;
}

/**
 * [parseFmCalls description]
 * @param  {[array]} dataArray [description]
 * @return {[type]}           [description]
 */
function parseFmCalls(data){
	let responseObject = new LastFmObject();
	let container = [];

	console.log(data);

	for (var i = 0; i < data.track.length; i++) {
		container.push(data.track[i]);
	}

	responseObject.tracks = container;
	return responseObject;
}


/**
 * [responseCallBack description]
 * @param  {[type]} err  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function responseCallBack(err, res, body){

	console.log('inside callback');
	if(typeof body === 'undefined' || body === null){
		console.log(err);
		console.log(res.statusCode);
		return false;
	}
	else{

		//lets parse the data from the raw response
		let jsonParsedData = JSON.parse(body); 

		//now let's parse the data again, we need to have the data massaged for this application
	    let massagedData = parseFmCalls(jsonParsedData.recenttracks);

		LastFMData.userRecentTracks = massagedData;

		console.log("data has been parsed succesfully");
	}
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


/**
 * [description]
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next)                {               res.render('lastfm', { title: 'Last FM', lastFmData : LastFMData });        getRequest(LastFmApi.userRecentTracks(userName, apiKey) [description]
 * @param  {[type]} responseCallBack);} [description]
 * @return {[type]}                      [description]
 */
router.get('/', function(req, res, next) {
    res.render('lastfm', { title: 'Last FM', lastFmData : LastFMData });

    //make the call to last fm and get back the user recent tracks
    getRequest(LastFmApi.userRecentTracks(userName, apiKey), responseCallBack);

});




module.exports = router;
