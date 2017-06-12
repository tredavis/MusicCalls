$(function() {

    var socket = io.connect('http://localhost:8000');

    socket.on('savedTracks', function(data) {
        console.log(data);
    });

    socket.on('recentTracks', function(data) {
        console.log(data);
    });
});
