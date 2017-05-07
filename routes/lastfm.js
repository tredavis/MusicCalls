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
    userRecentTracks: [],
    topArtists: []
}

/**
 * [LastFmObject description]
 */
function LastFmTrackObject() {
	this.contructor = 'LastFmTrackObject',
    this.tracks = []
}


function LastFmArtistObject() {
	this.contructor = 'LastFmArtistObject',
    this.artistName = '';
    this.artistId = '';
    this.rank = 0;
    this.playCount = 0;
}

/**
 * [parseFmCalls description]
 * @param  {[array]} dataArray [description]
 * @return {[type]}           [description]
 */
function parseFmCalls(data, outObject) {
	console.log(data);
	console.log("inside of "+ parseFmCalls.name + "this is the type for the outObject: " + outObject.contructor)
    if (outObject.contructor === 'LastFmTrackObject') { 
        let container = [];

        for (var i = 0; i < data.track.length; i++) {
            container.push(data.track[i]);
        }

        outObject.tracks = container;
        return outObject;
    }
    else if (outObject.contructor === 'LastFmArtistObject'){

        let artistsContainer = [];

        for (var i = 0; i < data.artist.length; i++) {
            artistsContainer.push(data.artist[i]);
        }

        outObject = artistsContainer;
        return artistsContainer;
    }
    else{
    	console.log("something went wrong");
    }
}


/**
 * [recentTracksCallBack This callback is to be used specifically with the recent tracks method call]
 * @param  {[type]} err  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function recentTracksCallBack(err, res, body) {

    console.log('inside callback');
    if (typeof body === 'undefined' || body === null) {
        console.log(err);
        console.log(res.statusCode);
        return false;
    } else {

        //lets parse the data from the raw response
        let jsonParsedData = JSON.parse(body);

        //now let's parse the data again, we need to have the data massaged for this application
        let massagedData = parseFmCalls(jsonParsedData.recenttracks, new LastFmTrackObject());
        LastFMData.userRecentTracks = massagedData;

        if(typeof massagedData !== 'undefined' && massagedData !== null)
        console.log(recentTracksCallBack.name + "has parsed your data succesfully");
    }
}

/**
 * [topArtistsCallBack description]
 * @param  {[type]} err  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function topArtistsCallBack(err, res, body) {

    console.log('inside callback');
    if (typeof body === 'undefined' || body === null) {
        console.log(err);
        console.log(res.statusCode);
        return false;
    } else {

        //lets parse the data from the raw response
        let jsonParsedData = JSON.parse(body);

        //now let's parse the data again, we need to have the data massaged for this application
        let massagedData = parseFmCalls(jsonParsedData.topartists, new LastFmArtistObject());
        LastFMData.topArtists = massagedData;

        if(typeof massagedData !== 'undefined' && massagedData !== null)
        console.log(topArtistsCallBack.name + "has parsed your data succesfully");
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
    res.render('lastfm', {
        title: 'Last FM',
        lastFmDataTracks: LastFMData.userRecentTracks,
        topArtistList : LastFMData.topArtists
    });
});

router.get('/userrecentracks', function(req, res, next) {
    res.render('lastfm', {
        title: 'Last FM',
        lastFmDataTracks: LastFMData.userRecentTracks,
        topArtistList : LastFMData.topArtists
    });
    	//make the call to last fm and get back the user recent tracks
   	getRequest(LastFmApi.userRecentTracks(userName, apiKey), recentTracksCallBack);
	

});

router.get('/topartists', function(req, res, next) {
	//console.log(req.params);

    res.render('lastfm', {
        title: 'Last FM',
        topArtistList: LastFMData.topArtists,
        lastFmDataTracks: LastFMData.userRecentTracks,
        testRequestData: req
    });

    getRequest(LastFmApi.userTopArtist(userName, apiKey), topArtistsCallBack);

});




module.exports = router;
