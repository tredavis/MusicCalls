"use strict";

//new amazon db object
var AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB();

//the endpooint and connection to the db
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com",
    dynamodb: '2012-08-10'
});

//the db client
var dataBaseClient = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

//global tables object
exports.Tables = [];

exports.ActiveTable = 'RecentTracks';

exports.listTables = function(callBack) {
    var params = {};
    dataBaseClient.listTables(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
            exports.Tables.push(data);

            callBack(exports.Tables);
        }
    });
};

/**
 * [writeToDynamo description]
 * @param  {[type]} data     [description]
 * @param  {[type]} type     [description]
 * @param  {[type]} callBack [description]
 * @return {[type]}          [description]
 */
exports.writeToDb = function(table, data, type, callBack) {
    //we need to create a dto object and write the data to the aws database
    var idCounter = 0;

    for (var i = 0; i < data.length; i++) {

        for (var y = 0; y < data[i].length; y++) {

            //we're gonna pass in the object and the table so we can know how to shape the data
            var dto = new AWSDto(data[i][y], table);

            var params = {
                TableName: table,
                ReturnConsumedCapacity: "TOTAL",
                Item: dto
            };


            if (dataBaseClient !== null && typeof dataBaseClient !== 'undefined') {
                //scan returns all the items of the list
                dataBaseClient.putItem(params, function(err, data) {
                    if (err) {
                        console.error("unable to read item. error json:", JSON.stringify(err, null, 2));
                    } else {
                        //let's sending back to the callback function
                        callBack(data);
                    }
                });
            }

            idCounter++;
        }

    }

}

exports.showAllItems = function(table, callBack) {
    var retArr = [];
    var params = {
        TableName: table,
        ReturnConsumedCapacity: "TOTAL"
    };

    dataBaseClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            retArr.push(data);

            callBack(retArr);
        }
    });
}



/**
 * [AWSDto description]
Contains logic to determine which AWS DTO to create.
 * @param {[type]} object [description]
 * @param {[type]} table  [description]
 */
function AWSDto(object, table) {
    if (table === "TopTracks") {
        return new TopTrackDto(object)
    } else if (table === "TopTags") {
        return new TopTagDto(object)
    } else if (table === "TopArtist") {
        return new LastFmArtistDto(object)
    } else if (table === "Friends") {
        return new LastFriendDto(object)
    } else if (table === "RecentTracks") {
        return new LastFmTrackDto(object)
    } else {
        console.log("Unable to create a dto object")
    }
}


/**
 * [TopTrackDto description]
Creates and returns a TopTrack Data Transfer Object
 * @param {[type]} track [description]
 */
function TopTrackDto(track) {
    return {
        "trackId": {
            "N": idCounter.toString()
        },
        "mbid": {
            "S": track.mbid["S"]
        },
        "name": {
            "S": track.name["S"]
        },
        "artistName": {
            "S": track.artistName["S"]
        },
        "artistmbid": {
            "S": track.artistmbid["S"]
        },
        "playCount": {
            "S": track.playCount["S"]
        },
        "duration": {
            "S": track.duration["S"]
        },
        "rank": {
            "S": track.rank["S"]
        }
    }
}


/**
 * [TopTagDto description]
 * @param {[type]} object [description]
 */
function TopTagDto(object) {
    return {};
};


/**
 * [LastFmArtistDto description]
 * @param {[type]} object [description]
 */
function LastFmArtistDto(object) {
    return {};
};


/**
 * [LastFriendDto description]
 * @param {[type]} object [description]
 */
function LastFriendDto(object) {
    return {};
};


/**
 * [LastFmTrackDto description]
 * @param {[type]} object [description]
 */
function LastFmTrackDto(object) {
    return {};
};
