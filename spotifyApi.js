"use strict";
var request = require('request');


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
        getUserSavedTracks: function(access_token, callback) {
            var returnItems = [];

            getRequest('https://api.spotify.com/v1/me/tracks?access_token=' + access_token + '&limit=50', function(err, response) {

                        //was there an error
                        if (typeof err !== 'undefined' && err !== null) {
                            console.log("There was an error in the getUserSavedTracks call: " + err)
                        }

                        // if not let's send the data back
                        if (typeof response !== 'undefined' && response !== null) {
                            //the tracks returned from the call
                            callback(JSON.parse(response));
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
                usersRecentlyPlayed: function(access_token, callback) {
                    getRequest('https://api.spotify.com/v1/me/player/recently-played?access_token=' + access_token, function(err, response) {

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


        function getRequest(path, callback) {
            request.get(path, callback);
        }
