"use strict";
let express = require('express');
let router = express.Router();
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

//let's grab the spotify access keys
let keys = require('../keys.js').SpotifyKeys;

//the scopes that are availabe from spotify.
let scopes = "playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private streaming user-follow-modify user-follow-read user-library-read user-library-modify user-read-private user-read-birthdate user-read-email user-top-read";
let redirect_uri = "http://localhost:3000/spotify/callback";

//the spotify object
var SpotifyWebApi = require('spotify-web-api-node');

//spotify auth key
let stateKey = 'spotify_auth_state';

//the spotify url
let authString = 'https://accounts.spotify.com/authorize' + '?response_type=code' + '&state=' + stateKey + '&client_id=' + keys.clientId + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') + '&redirect_uri=' + encodeURIComponent(redirect_uri);


// credentials are optional
// var spotifyApi = new SpotifyWebApi({
//     clientId: keys.clientId,
//     clientSecret: keys.clientSecret,
//     redirectUri: 'http://localhost:3000/spotify/login'
// });

function getRequest(path, callback) {
    request.get(path, callback);
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    //startAuth(res);
});

router.get('/login', function(req, res, next) {

    //starts the spotify authenication
    res.redirect(authString);
});

router.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    res.clearCookie(stateKey);
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(keys.clientId + ':' + keys.clientSecret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            var access_token = body.access_token,
                refresh_token = body.refresh_token;

            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
                console.log(body);
            });

            // we can also pass the token to the browser to make requests from there
            res.redirect('/#' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        } else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    });

});

router.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

module.exports = router;
