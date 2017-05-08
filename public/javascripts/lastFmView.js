$(function() {

    /**
     * [ClientData description]
     * @type {Object}
     */
    var ClientData = {
            imagesPresent: false,
            topArtistPresent: false,
            recentTracksPresent: false,
            topTracksPresent: false,
            checkStaus: function() {
                if (imagesPresent && topArtistPresent && recentTracksPresent && topTracksPresent)
                    socket.close();
            }
        }
        //stops the images from being created more than once

    console.log("lastFmView.js has been reached!");
    console.log("ready!");

    var socket = io.connect('http://localhost:8080');

    socket.on('friendsGathered', function(data) {

        if (ClientData.imagesPresent === false) {
            for (var i = 0; i < data.friends.length; i++) {
                insertFriendImage(data.friends[i]);
            }
        }
    });

    socket.on('topartistsGathered', function(data) {
        ClientData.topArtistPresent = true;
        console.log(data);
    });
    socket.on('userRecentTracksGathered', function(data) {
        ClientData.recentTracksPresent = true;
        console.log(data);
    });
    socket.on('topTracksGathered', function(data) {
        ClientData.topTracksPresent = true;
        console.log(data);
    });

    function loadData(data) {

        for (var list in data) {
            console.log(data[list]);
        }
    }

    /**
     * [insertFriendImage description]

     * @param  {[type]} friend [description]
     * @return {[type]}        [description]
     */
    function insertFriendImage(friend) {
        var columns = $('<div>', { id: "imageWell", "class": "col-md-12 col-md-12" });

        var divCon = $("<div>", { "class": "imageContainer thumbnail" });
        columns.append(divCon);

        var row = $("<div>", { "class": "row" })
        divCon.append(row);

        var div = $("<div>", { "class": "col-md-12 col-xs-12" });
        row.append(div);

        var img = $("<img>", { id: friend.name, src: friend.imageMedium });
        div.append(img);

        var playCount = $("<p>", { id: "friendPText" }).text(friend.name + " has scrobbled " + friend.playCount + " times!");
        div.append(playCount)

        $("#friendImageDiv").append(columns);

        ClientData.imagesPresent = true;
    }
});
