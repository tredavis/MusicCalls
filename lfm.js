"use strict"

//Last.fm User Helpers 
//example to get the top tracks for the current authenicated user.
//From Node script
//lfm = require('/lastfmcalls.js')
//request.get(lfm.userTopTracks, function(err, response){
//console.log(response.body) to store this data you will have to call JSON.parse(response.body). <-- I recommend storing it in a variable. 
//});
//

let apiKey = '1f579ca816d811e1c3f9578a27be8057';

exports.TimePeriods = {
    Overall: 'overall',
    OneWeek: '7day',
    OneMonth: '1month',
    ThreeMonth: '3month',
    SixMonth: '6month',
    OneYear: '12month'

}

exports.userRecentTracks = function(username, page) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&page=' + page + '&api_key=' + apiKey + '&format=json';
};

exports.getFriends = function(username, timePeriod, page) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=' + username + '&page=' + page + '&period=' + timePeriod + '&api_key=' + apiKey + '&format=json';
}

exports.userTopTracks = function(username, timePeriod, page) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=' + username + '&page=' + page + '&period=' + timePeriod + '&api_key=' + apiKey + '&format=json';
};

exports.userRecommendedArtists = function(username) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.getRecommendedArtists&user=' + username + '&api_key=' + apiKey + '&format=json';
};

exports.userTopArtist = function(username) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=' + username + '&api_key=' + apiKey + '&limit=100&format=json';
};

exports.userWeeklyCharts = function(username) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.getweeklychartlist=' + username + '&api_key=' + apiKey + '&format=json';
};

exports.userWeeklyTrackChart = function(username) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart=' + username + '&api_key=' + apiKey + '&format=json';
};

exports.userWeeklyArtistChart = function(username) {
    return 'http://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart=' + username + '&api_key=' + apiKey + '&format=json';
};

//Last.fm Tracks Methods
exports.trackSearch = function(trackName) {
    return 'http://ws.audioscrobbler.com/2.0/?method=track.search&track=' + trackName + '&api_key=' + apiKey + '&format=json';
};

exports.trackTopFan = function(artist, trackName) {
    return 'http://ws.audioscrobbler.com/2.0/?method=track.gettopfans&artist=' + artist + '&track=' + trackName + '&api_key=' + apiKey + '=json';
};

exports.trackSimilar = function(artist, trackName) {
    //Must Pass artist, trackName and apiKey
    return 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=' + artist + '&track=' + trackName + '&api_key=' + apiKey + '=json';
};


//User Tastes methods
exports.compareUserTaste = function(user1, user2) {
    return 'http://ws.audioscrobbler.com/2.0/?method=tasteometer.compare&type1=user&type2=user&value1=' + user1 + '&value2=' + user2 + '&api_key=' + apiKey + '&format=json';
};

exports.compareUserToArtist = function(artist, user) {
    return 'http://ws.audioscrobbler.com/2.0/?method=tasteometer.compare&type1=artists&type2=user&value1=' + artist + '&value2=' + user + '&api_key=' + apiKey + '&format=json';
};


//Requires api_sig
//exports.trackScrobble = function (trackName, apiKey) {
//    return 'http://ws.audioscrobbler.com/2.0/?method=track.s&track=' + trackName + '&api_key=' + apiKey + '&format=json'
//};

exports.libraryTracks = function(user) {
    return 'http://ws.audioscrobbler.com/2.0/?method=library.gettracks&api_key=' + apiKey + '&user=' + user + '&format=json';
};

exports.libraryArtist = function(user) {
    return 'http://ws.audioscrobbler.com/2.0/?method=library.getartist&api_key=' + apiKey + '&user=' + user + '&format=json';
};

exports.libraryAlbum = function(user) {
    return 'http://ws.audioscrobbler.com/2.0/?method=library.getalbums&api_key=' + apiKey + '&user=' + user + '&format=json';
};

// Get Metro Areas 
exports.metros = function(country) {
    return 'http://ws.audioscrobbler.com/2.0/?method=geo.getmetros&country=' + country + '&api_key=' + apiKey + '&format=json';
};

exports.metroHypeTrackChart = function(metro, country) {
    return 'http://ws.audioscrobbler.com/2.0/?method=geo.getmetrohypetrackchart&country=' + country + '&metro=' + metro + '&api_key=' + apiKey + '&format=json';
};

exports.metroEvents = function(metro) {
    return 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&location=' + metro + '&api_key=' + apiKey + '&format=json';
};

exports.metroArtistChart = function(metro, country) {
    return 'http://ws.audioscrobbler.com/2.0/?method=geo.getmetroartistchart&country=' + country + '&metro=' + metro + '&api_key=' + apiKey + '&format=json';
};

exports.metroHypeTrackChart = function(metro, country) {
    return 'http://ws.audioscrobbler.com/2.0/?method=geo.getmetrohypetrackchart&country=' + country + '&metro=' + metro + '&api_key=' + apiKey + '&format=json';
};


exports.metroTrackChart = function(metro, country) {
    return 'http://ws.audioscrobbler.com/2.0/?method=geo.getmetrotrackchart&country=' + country + '&metro=' + metro + '&api_key=' + apiKey + '&format=json';
};

//Events 
//Will user to see nearest events, and see other attendess, and share info with one another.
//exports.shareEvent = function () {
//    return 
//};

exports.eventInfo = function(eventId) {
    return 'http://ws.audioscrobbler.com/2.0/?method=event.getinfo&event=' + eventId + '&api_key=' + apiKey + '=json';
};

exports.eventAttendes = function(eventId) {
    return 'http://ws.audioscrobbler.com/2.0/?method=event.getattendees&event=' + eventId + '&api_key=' + apiKey + '=json';
};

exports.eventShout = function(eventId) {
    return 'http://ws.audioscrobbler.com/2.0/?method=event.getshouts&event=' + eventId + '&api_key=' + apiKey + '=json';
};

//Artist Methods
exports.artistSearch = function(artist) {
    return 'http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=' + artist + '&api_key=' + apiKey + '&format=json';
};

exports.artistTopTracks = function(artist) {
    return 'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=' + artist + '&api_key=' + apiKey + '&format=json';
};

exports.artistTopFans = function(artist) {
    return 'http://ws.audioscrobbler.com/2.0/?method=artist.gettopfans&artist=' + artist + '&api_key=' + apiKey + '&format=json';
};

exports.artistEvents = function(artist) {
    return 'http://ws.audioscrobbler.com/2.0/?method=artist.getevents&artist=' + artist + '&api_key=' + apiKey + '&format=json';
};
