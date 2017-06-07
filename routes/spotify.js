"use strict";

let express = require('express');
let router = express.Router();

//let's grab the spotify access keys
let keys = require('../keys.js').SpotifyKeys;

//the scopes that are availabe from spotify.
let scopes = "playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private streaming user-follow-modify user-follow-read user-library-read user-library-modify user-read-private user-read-birthdate user-read-email user-top-read";
let redirect_uri = "http://localhost:3000/spotify";

//the spotify object
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
// var spotifyApi = new SpotifyWebApi({
//     clientId: keys.clientId,
//     clientSecret: keys.clientSecret,
//     redirectUri: 'http://localhost:3000/spotify'
// });


function startAuth() {
    console.log("about to make a call");
    let authString = 'https://accounts.spotify.com/authorize' + '?response_type=code' + '&client_id=' + keys.SpotifyKeys + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') + '&redirect_uri=' + encodeURIComponent(redirect_uri);

    getRequest(authString, function(data) {

        console.log("inside the spotify callback");
        console.log(data);

    });
}

function getRequest(path, callback) {
    request.get(path, callback);
}

/* GET users listing. */
router.get('spotify', function(req, res, next) {
    console.log('yo')
    startAuth();

    // res.render('spotify', {
    //     title: 'Spotify Data Gathering Page'
    // });

});

module.exports = router;
