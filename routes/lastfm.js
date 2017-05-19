"use strict";

let express = require('express');
let router = express.Router();
let LastFmApi = require('../lfm.js')
let request = require('request');
var awsDb = require('../awsDb.js');

//socket io stuff
let server = require('http').createServer(router);
let io = require('socket.io').listen(server);

server.listen(8080);

//global keys
let userName = '';

/**
 * [enviorment description]
 * If this is dynamo, the app will read from the dynamo web app.
 * If this is local/web, the app will make calls to the last fm api.
 * @type {String}
 */
let enviorment = 'dynamo';

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
        //awsDb.showAllItems(LastFmApi.ActiveTable, dynamoCallBack);

        //searches for data here. We will either call to dynamo db for the data or call to last fm's api.
        //
        //if ()
        //get the users friends
        //getRequest(LastFmApi.getFriends(user), friendsCallBack);

        //this get's the user recent tracks

        //getRequest(LastFmApi.userRecentTracks(user, 1), recentTracksCallBack);
        //getRequest(LastFmApi.userTopArtist(user), topArtistsCallBack);
        getRequest(LastFmApi.userTopTracks(user, LastFmApi.TimePeriods.OneWeek, 1), topTracksCallBack);
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
    this.artistMbid = '';
    this.playcount = 1;

    if (typeof rawTrack !== 'undefined') {
        this.name = rawTrack.name;
        this.album = rawTrack.album['#text'];
        this.albumMbid = rawTrack.album.mbid;
        this.artistName = rawTrack.artist['#text'];
        this.artistMbid = rawTrack.artist.mbid;
        this.dateText = rawTrack.date['#text'];
        this.dataUTC = rawTrack.date.uts;

        if (rawTrack.album.mbid === '')
            this.albumMbid = 'albumMbid is not available'

        if (rawTrack.artist.mbid === '')
            this.artistMbid = 'artist mbid'
    }
}

/**
 * [TopTrackObject description]

 * @param {[type]} rawTrack [description]
 */
function TopTrackObject(rawTrack) {
    this.contructor = { "S": 'TopTrackObject' };
    this.userId = { "S": 'N/A' };
    this.name = 'N/A';
    this.mbid = 'N/A';
    this.artistName = 'N/A';
    this.artistmbid = 'N/A';
    this.playCount = 'N/A';
    this.duration = 'N/A';
    this.rank = 'N/A';

    if (typeof rawTrack !== 'undefined') {
        this.name = { "S": rawTrack.name };
        this.mbid = { "S": rawTrack.mbid };
        this.artistName = { "S": rawTrack.artist.name };
        this.artistmbid = { "S": rawTrack.artist.mbid };
        this.playCount = { "S": rawTrack.playcount };
        this.duration = { "S": rawTrack.duration };
        this.rank = { "S": rawTrack['@attr'].rank };

        if (rawTrack.mbid === '')
            this.mbid = { "S": "No mbid available" };

        if (rawTrack.artist.mbid === '')
            this.artistmbid = { "S": "No mbid available" };
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
            //LastFMData.fetchData();
        })();

    }
}

/**
 * [parseFmCalls description]
 * @param  {[array]} dataArray [description]
 * @return {[type]}           [description]
 */
function parseFmCalls(data, outObject) {
    console.log("inside of " + parseFmCalls.name + "this is the type for the outObject: " + outObject.contructor["S"])

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
    } else if (outObject.contructor["S"] === 'TopTrackObject') {
        let topTrackContainer = [];

        if (typeof data.track !== 'undefined') {
            //let's flatten the artist data struture
            for (var i = 0; i < data.track.length; i++) {
                topTrackContainer.push(new TopTrackObject(data.track[i]));
            }
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
            var attr = jsonParsedData.recenttracks['@attr'];

            //let's parse the data out and push it to the LastFmData.userRecentTracks array.
            let massagedData = parseFmCalls(jsonParsedData.recenttracks, new LastFmTrackObject());
            LastFMData.userRecentTracks.push(massagedData);

            //did we get our massaged data back?
            if (typeof massagedData !== 'undefined' && massagedData !== null) {
                console.log(recentTracksCallBack.name + " has parsed your data succesfully");

                //if so let's make sure we got make the necessary data in order to sort the arrays.
                if (attr !== undefined && attr !== null) {

                    //if we aren't at the end of the data pages, we will start another get request recursively using this recent tracks callback.
                    if (parseInt(attr.page) < parseInt(attr.totalPages)) {

                        //logging really for sanity here
                        //this is logically unecessary.
                        console.log("we are currently on page:" + parseInt(attr.page));

                        //the recursive call to the Last Fm api
                        getRequest(LastFmApi.userRecentTracks(attr.user, parseInt(attr.page) + 1), recentTracksCallBack);

                    } else {

                        //again we are logging for testing purposes
                        console.log("we are currently on page: " + attr.page + " of " + attr.totalPages + "");

                        //since we are done let's emit the results to the client
                        LastFMData.events.emit('userRecentTracksGathered', { userRecentTracks: LastFMData.userRecentTracks });

                        //since we are using the amazon db write this to the db
                        awsDb.writeToDynamo(LastFMData.userRecentTracks);
                    }
                }

                if (LastFMData.events !== null) {

                    LastFMData.events.emit('userRecentTracksGathered', { userRecentTracks: LastFMData.userRecentTracks })
                    writeToDynamo(LastFmApi.ActiveTable, LastFMData.userRecentTracks, "put")
                }
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
            var attr = jsonParsedData.toptracks['@attr'];

            //now let's parse the data again, we need to have the data massaged for this application
            let massagedData = parseFmCalls(jsonParsedData.toptracks, new TopTrackObject());
            LastFMData.topTracks.push(massagedData);

            if (typeof massagedData !== 'undefined' && massagedData !== null) {
                console.log(topTracksCallBack.name + "has parsed your data succesfully");
                //if so let's make sure we got make the necessary data in order to sort the arrays.
                if (attr !== undefined && attr !== null) {
                    var currentPage = parseInt(attr.page);
                    var totalPages = parseInt(attr.totalPages);
                    var nextPage = currentPage + 1;

                    //if we aren't at the end of the data pages, we will start another get request recursively using this recent tracks callback.
                    if (currentPage <= 5) {

                        console.log("On page: " + currentPage + "out of : " + totalPages)


                        console.log('=========================');
                        console.log('This is the next page: ' + nextPage);
                        console.log('=========================');


                        getRequest(LastFmApi.userTopTracks(attr.user, LastFmApi.TimePeriods.AllTime, nextPage), topTracksCallBack);

                    } else {

                        //again we are logging for testing purposes
                        console.log("we are currently on page: " + attr.page + " of " + attr.totalPages + "");

                        ////since we are using the amazon db write this to the db
                        awsDb.writeToDb("TopTracks", LastFMData.topTracks, "put", function(data) {

                            console.log("the data went to amazon succesfully");
                            console.log(data);

                        });

                        //since we are done let's emit the results to the client
                        if (LastFMData.events !== null) {
                            LastFMData.events.emit('topTracksGathered', { topTracks: LastFMData.topTracks })
                        }

                    }
                }


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

                if (LastFMData.events !== null) {
                    LastFMData.events.emit('friendsGathered', { friends: LastFMData.friends })

                    //push to dynamo 
                    //writeToDynamo(LastFMData.friends, "put")

                }
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
    LastFMData.fetchData("montredavis");
    res.render('lastfm', {
        title: 'Music Database!',
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
    awsDb.listTables(function(tables) {

        LastFMData.events.emit('dbTables', { tables: awsDb.Tables });

        for (var i = 0; i < tables[0].TableNames.length; i++) {

            awsDb.showAllItems(tables[0].TableNames[i], function(data) {

                LastFMData.events.emit('allItems', { items: data });
            });
        };
    });

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
        if (enviorment === 'dynamo') {

            userName = "montredavis";
            awsDb.showAllItems(LastFmApi.ActiveTable, dynamoCallBack);

        } else {

            userName = req.body.username;
            LastFMData.fetchData(userName);

        }

        res.render('lastfm', {
            title: 'Last FM',
            user: { name: userName },
            data: LastFMData,

        });
    }
});


function dynamoCallBack(data, foundData) {
    LastFMData.events.emit('userRecentTracksGathered', { userRecentTracks: data });
}


module.exports = router;
