"use strict";
var request = require('request');

exports.SpotifyCache = {
    usrSavedTracks: [],
    recentTracks: [],
    loadBalancer: 5
};

exports.Calls = {

    //get the current user's information
    getMe: function(access_token, callback) {

        getRequest('https://api.spotify.com/v1/me/tracks?access_token=' + access_token, function(err, response) {

            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the getMe call: " + err)
            }

            // if not let's send the data back
            if (typeof response !== 'undefined' && response !== null) {
                callback(JSON.parse(response.body));
            }

        });
    },
    getUserSavedTracks: function(url, access_token, callback) {

        var defaultPath = 'https://api.spotify.com/v1/me/tracks?access_token=';

        //if we caller didn't pass in a url. 
        //use the default, if not we change it to the passed in url
        if (url !== '') {
            defaultPath = url;
        }

        //the call to spotifies api
        getRequest(defaultPath + access_token + '&limit=50', function(err, response) {
            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the getUserSavedTracks call: " + err)
            }

            // let's make sure we actually got a response back.
            if (typeof response !== 'undefined' && response !== null) {
                exports.SpotifyCache.loadBalancer--;

                //let's push the returned data to our cached array
                exports.SpotifyCache.usrSavedTracks.push(JSON.parse(response.body).items);

                //if we the loadbalance value is 0 let's reset it and send the data to the view.
                if (exports.SpotifyCache.loadBalancer === 0) {
                    exports.SpotifyCache.loadBalancer = 5;
                    callback(exports.SpotifyCache.usrSavedTracks);
                }

                //the url to the next set of data. 
                //thank goodness spotify gives us this.
                var nextUrl = JSON.parse(response.body).next;

                if (nextUrl !== null && typeof nextUrl !== "undefined") {
                    //this is a recursive call
                    exports.Calls.getUserSavedTracks(nextUrl + '&access_token=', access_token, callback);

                } else {
                    //send the data through the callback url.
                    callback(exports.SpotifyCache.usrSavedTracks);
                }
            }
        });

    },
    getUserTopTracks: function(access_token, callback) {
        getRequest('https://api.spotify.com/v1/me/top/tracks?access_token=' + access_token, function(err, response) {

            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the getUserTopTracks call: " + err)
            }

            // if not let's send the data back
            if (typeof response !== 'undefined' && response !== null) {
                callback(JSON.parse(response.body));
            }

        });
    },
    getUserTopArtists: function(access_token, callback) {
        getRequest('https://api.spotify.com/v1/me/top/artists?access_token=' + access_token, function(err, response) {

            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the getUserTopArtists call: " + err)
            }

            // if not let's send the data back
            if (typeof response !== 'undefined' && response !== null) {
                callback(JSON.parse(response.body));
            }

        });
    },
    getFollowedArtists: function(access_token, callback) {
        getRequest('https://api.spotify.com/v1/me/following?type=artist?access_token=' + access_token, function(err, response) {

            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the getFollowedArtists call: " + err)
            }

            // if not let's send the data back
            if (typeof response !== 'undefined' && response !== null) {
                callback(JSON.parse(response.body));
            }

        });
    },
    usersRecentlyPlayed: function(url, access_token, callback) {
        var defaultPath = 'https://api.spotify.com/v1/me/player/recently-played?access_token=';

        //if we caller didn't pass in a url. 
        //use the default, if not we change it to the passed in url
        if (url !== '') {
            defaultPath = url;
        }

        getRequest(defaultPath + access_token + '&limit=50', function(err, response) {

            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the usersRecentlyPlayed call: " + err)
            }

            // if not let's send the data back
            if (typeof response !== 'undefined' && response !== null) {
                exports.SpotifyCache.loadBalancer--;

                //let's push the returned data to our cached array
                exports.SpotifyCache.recentTracks.push(JSON.parse(response.body).items);

                //if we the loadbalance value is 0 let's reset it and send the data to the view.
                if (exports.SpotifyCache.loadBalancer === 0) {
                    exports.SpotifyCache.loadBalancer = 5;
                    callback(exports.SpotifyCache.recentTracks);
                }

                //the url to the next set of data. 
                //thank goodness spotify gives us this.
                var nextUrl = JSON.parse(response.body).next;

                if (nextUrl !== null && typeof nextUrl !== "undefined") {
                    //this is a recursive call
                    exports.Calls.usersRecentlyPlayed(nextUrl + '&access_token=', access_token, callback);

                } else {
                    //send the data through the callback url.
                    callback(exports.SpotifyCache.recentTracks);
                }
            }

        });
    },
    usersCurrentSong: function(access_token, callback) {
        getRequest('https://api.spotify.com/v1/me/player?access_token=' + access_token, function(err, response) {

            //was there an error
            if (typeof err !== 'undefined' && err !== null) {
                console.log("There was an error in the usersCurrentSong call: " + err)
            }

            // if not let's send the data back
            if (typeof response !== 'undefined' && response !== null) {
                callback(JSON.parse(response.body));
            }

        });
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
