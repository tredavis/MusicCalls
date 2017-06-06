"use strict";

let express = require('express');
let router = express.Router();

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: 'fcecfc72172e4cd267473117a17cbd4d',
    clientSecret: 'a6338157c9bb5ac9c71924cb2940e1a7',
    redirectUri: 'http://www.example.com/callback'
});

console.log(spotifyApi);


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Spotify Data Gathering Page' });
    res.send('respond with a resource');
});

module.exports = router;
