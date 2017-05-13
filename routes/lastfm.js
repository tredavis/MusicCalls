"use strict"

let express = require('express');
let router = express.Router();
let LastFmApi = require('../lfm.js')
let request = require('request');

//socket io stuff
let server = require('http').createServer(router);
let io = require('socket.io').listen(server);

server.listen(8080);

//global keys
let userName = 'montredavis';

/**
 * [LastFMData description]

 * @type {Object}
 */
var LastFMData = {
    users: [],
    events: null,
    userRecentTracks: [],
    topArtists: [],
    topTracks: [],
    friends: [],
    fetchData: function(user) {
        //get the users friends
        getRequest(LastFmApi.getFriends(user), friendsCallBack);
        getRequest(LastFmApi.userRecentTracks(user), recentTracksCallBack);
        getRequest(LastFmApi.userTopArtist(user), topArtistsCallBack);
        getRequest(LastFmApi.userTopTracks(user), topTracksCallBack);
    }
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
    this.playcount = '';

    if (typeof rawTrack !== 'undefined') {
        this.name = rawTrack.name;
        this.album = rawTrack.album['#text'];
        this.albumMbid = rawTrack.album.mbid;
        this.artistName = rawTrack.artist['#text'];
        this.artistmbid = rawTrack.artist.mbid;

    }
}

/**
 * [TopTrackObject description]

 * @param {[type]} rawTrack [description]
 */
function TopTrackObject(rawTrack) {
    this.contructor = 'TopTrackObject';
    this.name = '';
    this.mbid = '';
    this.artistName = '';
    this.artistmbid = '';
    this.playCount = '';
    this.duration = '';
    this.rank = '';

    if (typeof rawTrack !== 'undefined') {
        this.name = rawTrack.name;
        this.mbid = rawTrack.mbid;
        this.artistName = rawTrack.artist.name;
        this.artistmbid = rawTrack.artist.mbid;
        this.playCount = rawTrack.playcount;
        this.duration = rawTrack.duration;
        this.rank = rawTrack['@attr'].rank;
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
    this.data = null;
    this.name = '';
    this.age = '';
    this.gender = '';
    this.playCount = '';
    if (typeof rawFriend !== 'undefined') {
        this.name = rawFriend.name;
        this.age = rawFriend.age;
        this.gender = rawFriend.gender;
        this.playCount = rawFriend.playcount;
        this.playList = rawFriend.playlists;
        this.signUpDateUnix = rawFriend.registered.unixtime;

        if (this.signUpDateUnix !== null || typeof this.signUpDateUnix !== 'undefined') {
            var dateObj = new Date(this.signUpDateUnix * 1000);
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var day = dateObj.getUTCDate();
            var year = dateObj.getUTCFullYear()
            this.signUpDateUnix = year + "/" + month + "/" + day;
        }

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
        (function loadData() {
            LastFMData.fetchData();
        })();

    }
}

/**
 * [parseFmCalls description]
 * @param  {[array]} dataArray [description]
 * @return {[type]}           [description]
 */
function parseFmCalls(data, outObject) {
    console.log("inside of " + parseFmCalls.name + "this is the type for the outObject: " + outObject.contructor)

    //what happens when we get a track object
    if (outObject.contructor === 'LastFmTrackObject') {
        let trackContainer = [];

        if (typeof data.track !== 'undefined')
            for (var i = 0; i < data.track.length; i++) {
                trackContainer.push(new LastFmTrackObject(data.track[i]));
            }

        return trackContainer;
    } else if (outObject.contructor === 'LastFmArtistObject') {

        let artistsContainer = [];

        if (typeof data.artist !== 'undefined')
        //let's flatten the artist data struture
            for (var i = 0; i < data.artist.length; i++) {
            artistsContainer.push(new LastFmArtistObject(data.artist[i]));
        }

        return artistsContainer;
    } else if (outObject.contructor === 'LastFriendObject') {
        let friendContainer = [];

        if (typeof data.user !== 'undefined')
        //let's flatten the artist data struture
            for (var i = 0; i < data.user.length; i++) {
            friendContainer.push(new LastFriendObject(data.user[i]));
        }

        return friendContainer;
    } else if (outObject.contructor === 'TopTrackObject') {
        let topTrackContainer = [];

        if (typeof data.track !== 'undefined')
        //let's flatten the artist data struture
            for (var i = 0; i < data.track.length; i++) {
            topTrackContainer.push(new TopTrackObject(data.track[i]));
        }

        return topTrackContainer;
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
        //
        if (typeof jsonParsedData.recenttracks !== 'undefined') {

            let massagedData = parseFmCalls(jsonParsedData.recenttracks, new LastFmTrackObject());
            LastFMData.userRecentTracks = massagedData;

            if (typeof massagedData !== 'undefined' && massagedData !== null) {
                console.log(recentTracksCallBack.name + "has parsed your data succesfully");


                if (LastFMData.events !== null)
                    LastFMData.events.emit('userRecentTracksGathered', { userRecentTracks: LastFMData.userRecentTracks })
            }
        }
    }
}

/**
 * [topTracksCallBack description]

 * @param  {[type]} err  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function topTracksCallBack(err, res, body) {

    console.log('inside ' + topTracksCallBack.name + ' callback');

    if (typeof body === 'undefined' || body === null) {
        console.log(err);
        console.log(res.statusCode);
        return false;
    } else {

        //lets parse the data from the raw response
        let jsonParsedData = JSON.parse(body);
        if (typeof jsonParsedData.toptracks !== 'undefined') {

            //now let's parse the data again, we need to have the data massaged for this application
            let massagedData = parseFmCalls(jsonParsedData.toptracks, new TopTrackObject());
            LastFMData.topTracks = massagedData;

            if (typeof massagedData !== 'undefined' && massagedData !== null) {
                console.log(topTracksCallBack.name + "has parsed your data succesfully");


                if (LastFMData.events !== null)
                    LastFMData.events.emit('topTracksGathered', { topTracks: LastFMData.topTracks })
            }
        }
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

        if (typeof jsonParsedData.topartists !== 'undefined') {

            //now let's parse the data again, we need to have the data massaged for this application
            let massagedData = parseFmCalls(jsonParsedData.topartists, new LastFmArtistObject());
            LastFMData.topArtists = massagedData;

            if (typeof massagedData !== 'undefined' && massagedData !== null) {
                console.log(topArtistsCallBack.name + "has parsed your data succesfully");

                if (LastFMData.events !== null)
                    LastFMData.events.emit('topartistsGathered', { topArtists: LastFMData.topArtists })

            }
        }
    }
}


/**
 * [friendsCallBack description]

 * @param  {[type]} err  [description]
 * @param  {[type]} res  [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function friendsCallBack(err, res, body) {

    console.log('inside ' + friendsCallBack.name + ' callback');
    if (typeof body === 'undefined' || body === null) {
        console.log(err);
        console.log(res.statusCode);
    } else {

        //lets parse the data from the raw response
        let jsonParsedData = JSON.parse(body);

        //now let's parse the data again, we need to have the data massaged for this application
        if (typeof jsonParsedData.friends !== 'undefined') {

            let massagedData = parseFmCalls(jsonParsedData.friends, new LastFriendObject());

            LastFMData.friends = massagedData;

            if (typeof massagedData !== 'undefined' && massagedData !== null) {
                console.log(topArtistsCallBack.name + "has parsed your data succesfully");

                if (LastFMData.events !== null)
                    LastFMData.events.emit('friendsGathered', { friends: LastFMData.friends })
            }
        }
    }
}

/**
 * [getRequest description]

 * @param  {[type]}   path     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getRequest(path, callback) {
    request.get(path, callback);
}


io.on('connection', function(socket) {
    //set the connection to a global socket

    if (socket !== null || typeof socket !== 'undefined') {
        LastFMData.events = socket;
    }
});

io.on('close', function(socket) {
    console.log("the socket has been closed!");
});

/**
 * [description]

 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {               LastFMData.fetchData();                 res.render('lastfm', {        title: 'Welcome to your Music Database!',        user: { name: userName } [description]
 * @param  {[type]} data: LastFMData       });}                  [description]
 * @return {[type]}       [description]
 */
router.get('/', function(req, res, next) {
    //LastFMData.fetchData();
    res.render('lastfm', {
        title: 'Welcome to your Music Database!',
        user: { name: userName },
        data: LastFMData
    });
});


/**
 * [description]

 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {               LastFMData.fetchData();                 res.render('lastfm', {        title: 'Last FM',        user: { name: userName } [description]
 * @param  {[type]} data: LastFMData       });}                  [description]
 * @return {[type]}       [description]
 */
router.get('/userrecentracks', function(req, res, next) {
    //LastFMData.fetchData(userName);

    res.render('lastfm', {
        title: 'Last FM',
        user: { name: userName },
        data: LastFMData
    });
});

router.get('/topartists', function(req, res, next) {
    //LastFMData.fetchData(userName);

    res.render('lastfm', {
        title: 'Last FM',
        user: { name: userName },
        data: LastFMData
    });
});


router.post('/username', function(req, res) {
    if (req.body !== null || typeof req.body !== undefined) {
        userName = req.body.username;

        LastFMData.fetchData(userName);

        res.render('lastfm', {
            title: 'Last FM',
            user: { name: userName },
            data: LastFMData
        });
    }
});

module.exports = router;
