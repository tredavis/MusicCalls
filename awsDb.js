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

    var idCounter = 0;

    for (var i = 0; i < data.length; i++) {

        for (var y = 0; y < data[i].length; y++) {
            var params = {
                TableName: table,
                ReturnConsumedCapacity: "TOTAL",
                Item: {
                    "trackId": {
                        "N": idCounter.toString()
                    },
                    "mbid": {
                        "S": data[i][y].mbid["S"]
                    },
                    "artistName": {
                        "S": data[i][y].artistName["S"]
                    },
                    "artistmbid": {
                        "S": data[i][y].artistmbid["S"]
                    },
                    "playCount": {
                        "S": data[i][y].playCount["S"]
                    },
                    "duration": {
                        "S": data[i][y].duration["S"]
                    },
                    "rank": {
                        "S": data[i][y].rank["S"]
                    }
                }
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
