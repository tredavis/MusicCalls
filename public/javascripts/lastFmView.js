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
                console.log("checking status...");
                if (this.imagesPresent && this.topArtistPresent && this.recentTracksPresent && this.topTracksPresent) {
                    socket.close();
                    console.log("the socket has been closed");
                } else {

                }
            }
        }
        //stops the images from being created more than once

    console.log("lastFmView.js has been reached!");
    console.log("ready!");

    var socket = io.connect('http://localhost:8080');

    /**
     * [description]
     * @param  {[type]} data) {                   if (ClientData.imagesPresent [description]
     * @return {[type]}       [description]
     */
    socket.on('friendsGathered', function(data) {

        if (ClientData.imagesPresent === false) {
            for (var i = 0; i < data.friends.length; i++) {
                insertFriendImage(data.friends[i]);
                console.log(data.friends[i]);
            }
        }

        //do we need to close the socket??
        ClientData.checkStaus();
    });

    /**
     * [description]
     * @param  {[type]} data) {                   for (var i [description]
     * @return {[type]}       [description]
     */
    socket.on('dbTables', function(data) {
        for (var i = 0; i < data.tables.length; i++) {
            var dropDown = $("#dbSelector");
            //lets be safe and clear this out before adding more values in
            dropDown.empty();

            //let's walk the data we got back and add the drop down choices with events so we can live udate.
            for (var x = 0; x < data.tables[i].TableNames.length; x++) {
                console.log(data.tables[i].TableNames[x])
                var option = $("<option>", { id: "option" + x, "value": data.tables[i].TableNames[x] }).html(data.tables[i].TableNames[x]);
                $("#dbSelector").append(option);

                $("#dbSelector").on("change", function(data) {
                    console.log(data);
                });
            }
        }

        //close the connection
        //socket.close();
    });

    socket.on('allItems', function(data) {
        console.log(data);
    });

    /**
     * [description]
     * @param  {[type]} data) {                   ClientData.topArtistPresent [description]
     * @return {[type]}       [description]
     */
    socket.on('topartistsGathered', function(data) {
        ClientData.topArtistPresent = true;
        console.log(data);

        //do we need to close the socket??
        ClientData.checkStaus();
    });

    /**
     * [description]

     * @param  {[type]} data) {                   ClientData.recentTracksPresent [description]
     * @return {[type]}       [description]
     */
    socket.on('userRecentTracksGathered', function(data) {
        ClientData.recentTracksPresent = true;

        //let's collect and sort this data
        var sortedArr = [];
        sortedArr = data.userRecentTracks.Items;
        sortedArr.sort(function(a, b) {
            return a.trackId - b.trackId;
        });
        var displayObject = {
            tableId: 0,
            dto: null
        }

        //if (arr !== null && arr.length < 0) {
        //we need to loop through the list twice to write all the d
        for (var i = 0; i < sortedArr.length; i++) {
            var trackId = sortedArr[i].trackId;
            var dObj = sortedArr[i].dObject;

            //console.log("trackId : " + parseInt(trackId) + "  dObject: " + dObj);
            console.log("length " + dObj.length);

            if (typeof dObj !== 'undefined') {

                for (var x = 0; x < dObj.length; x++) {

                    var displayObject = {
                        id: sortedArr[i].trackId,
                        dto: sortedArr[i].dObject[x]
                    }

                    console.log(displayObject.dto);
                }
            }
        }

        //do we need to close the socket??
        ClientData.checkStaus();
    });

    /**
     * [description]
     * Top Tracks event listener from the server
     * @param  {[type]} data) {                   ClientData.topTracksPresent [description]
     * @return {[type]}       [description]
     */
    socket.on('tracks', function(data) {
        ClientData.topTracksPresent = true;

        var items = data.tracks[0].Items;

        var sortedArr = [];
        sortedArr = items;
        sortedArr.sort(function(a, b) {
            return a.rank['S'] - b.rank['S'];
        });

        for (var i = 0; i < 5; i++) {

            console.log(sortedArr[i])
        }

        //do we need to close the socket??
        ClientData.checkStaus();
    });


    /**
     * [insertFriendImage description]
     * Takes in the friend object and outputs it to the screen.
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

        var loadButton = $("<button>", { "data-name": friend.name, class: "btn btn-danger btn-sm loadBtn" }).html("Load Data");
        div.append(loadButton);

        var playCount = $("<p>", { id: "friendPText" }).text(friend.name + " has scrobbled " + friend.playCount + " times!");
        div.append(playCount)


        $("#friendImageDiv").append(columns);

        ClientData.imagesPresent = true;
    }


    // $("#userForm").on("click", ".loadBtn", function(data) {
    //     console.log(data + " was clicked");
    // });

    // console.log($("#userForm"))

});
