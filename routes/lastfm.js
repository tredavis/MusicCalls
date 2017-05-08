"use strict"

let express = require('express');
let router = express.Router();
let LastFmApi = require('../lfm.js')
let request = require('request');

//global keys
let userName = 'montredavis';

/**
 * [LastFMData description]
 * @type {Object}
 */
var LastFMData = {
    userRecentTracks: [],
    topArtists: [],
    friends: []
}

/**
 * [LastFmObject description]
 */
function LastFmTrackObject(rawTrack) {
    this.contructor = 'LastFmTrackObject';
    this.name = '';
    this.dateText = '';
    this.dataUTC = '';
    this.album = '';
    this.albumMbid = '';
    this.artistName = '';
    this.artistmbid = '';

    if (typeof rawTrack !== 'undefined') {
        this.name = rawTrack.name;
        this.album = rawTrack.album['#text'];
        this.albumMbid = rawTrack.album.mbid;
        this.artistName = rawTrack.artist['#text'];
        this.artistmbid = rawTrack.artist.mbid;
    }
}

/**
 * [LastFmArtistObject description]
 * @param {[type]} rawArtist [description]
 */
function LastFmArtistObject(rawArtist) {
    this.contructor = 'LastFmArtistObject';
    this.artistName = '';
    this.artistId = '';
    this.rank = 0;
    this.playCount = 0;

    if (typeof rawArtist !== 'undefined') {
        this.rank = rawArtist['@attr'].rank;
        this.artistName = rawArtist.name;
        this.playCount = rawArtist.playcount;
        this.artistId = rawArtist.mbid;
    }

}

/**
 * [LastFriendObject description]
 * @param {[type]} rawArtist [description]
 */
function LastFriendObject(rawFriend) {
    this.contructor = 'LastFriendObject';
    this.name = '';
    this.age = '';
    this.gender = '';
    this.playCount = '';

    if (typeof rawFriend !== 'undefined') {
        //console.log(rawArtist);

        this.name = rawFriend.name;
        this.age = rawFriend.age;
        this.gender = rawFriend.gender;
        this.playCount = rawFriend.playcount;
        this.playList = rawFriend.playlists;
        this.signUpDateUnix = rawFriend.registered.unixtime;

        if (this.signUpDateUnix !== null || typeof this.signUpDateUnix !== 'undefined')
            this.signUpDateUnix = new Date(this.signUpDateUnix * 1000)

        //get images
        for (var i = 0; i < rawFriend.image.length; i++) {

            if (rawFriend.image[i].size === 'small') {
                this.imageSmall = rawFriend.image[i]['#text'];
            }
            if (rawFriend.image[i].size === 'medium') {
                this.imageMedium = rawFriend.image[i]['#text'];
            }
            if (rawFriend.image[i].size === 'large') {
                this.imageLarge = rawFriend.image[i]['#text'];
            }
            if (rawFriend.image[i].size === 'extraLarge') {
                this.extraLarge = rawFriend.image[i]['#text'];
            }
        }
    }

}

/**
 * [parseFmCalls description]
 * @param  {[array]} dataArray [description]
 * @return {[type]}           [description]
 */
function parseFmCalls(data, outObject) {
    console.log(data);
    console.log("inside of " + parseFmCalls.name + "this is the type for the outObject: " + outObject.contructor)

    //what happens when we get a track object
    if (outObject.contructor === 'LastFmTrackObject') {
        let trackContainer = [];
        for (var i = 0; i < data.track.length; i++) {
            trackContainer.push(new LastFmTrackObject(data.track[i]));
        }

        return trackContainer;
    }

    //what happens when we call the artist objects
    else if (outObject.contructor === 'LastFmArtistObject') {

        let artistsContainer = [];

        //let's flatten the artist data struture
        for (var i = 0; i < data.artist.length; i++) {
            artistsContainer.push(new LastFmArtistObject(data.artist[i]));
        }

        return artistsContainer;
    } else if (outObject.contructor === 'LastFriendObject') {
        let friendContainer = [];

        //console.log(data);
        //let's flatten the artist data struture
        for (var i = 0; i < data.user.length; i++) {
            friendContainer.push(new LastFriendObject(data.user[i]));
        }

        return friendContainer;
    } else {
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

    console.log('inside ' + recentTracksCallBack.name + ' callback');

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

        if (typeof massagedData !== 'undefined' && massagedData !== null)
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

    console.log('inside ' + topArtistsCallBack.name + ' callback');

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

        if (typeof massagedData !== 'undefined' && massagedData !== null)
            console.log(topArtistsCallBack.name + "has parsed your data succesfully");
    }
}


function friendsCallBack(err, res, body) {

    console.log('inside ' + friendsCallBack.name + ' callback');
    if (typeof body === 'undefined' || body === null) {
        console.log(err);
        console.log(res.statusCode);
    } else {

        //lets parse the data from the raw response
        let jsonParsedData = JSON.parse(body);

        //now let's parse the data again, we need to have the data massaged for this application
        let massagedData = parseFmCalls(jsonParsedData.friends, new LastFriendObject());
        LastFMData.friends = massagedData;

        if (typeof massagedData !== 'undefined' && massagedData !== null)
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

    //get the users friends
    getRequest(LastFmApi.getFriends(userName), friendsCallBack);

    res.render('lastfm', {
        title: 'Welcome to your Music Database!',
        user: { name: userName },
        data: LastFMData
    });
});

router.get('/userrecentracks', function(req, res, next) {
    res.render('lastfm', {
        title: 'Last FM',
        user: { name: userName },
        data: LastFMData
    });
    //make the call to last fm and get back the user recent tracks
    getRequest(LastFmApi.userRecentTracks(userName), recentTracksCallBack);

});

router.get('/topartists', function(req, res, next) {
    //console.log(req.params);

    res.render('lastfm', {
        title: 'Last FM',
        user: { name: userName },
        data: LastFMData
    });

    getRequest(LastFmApi.userTopArtist(userName), topArtistsCallBack);

});




module.exports = router;
