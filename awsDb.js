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
var dataBaseClient = new AWS.DynamoDB.DocumentClient();
var table = "RecentTracks";


/**
 * [writeToDynamo description]
 * Writes or updates the items in the database
 * @param  {[type]} data [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
exports.writeTracksToTable = function(data, table) {

    //let's make sure you we have data and a table
    if (typeof data !== 'undefined' && typeof table !== 'undefined') {


        for (var i = 0; i < data.length; i++) {

            var params = {
                TableName: "RecentTracks",
                ReturnConsumedCapacity: "TOTAL",
                Item: {
                    trackId: i,
                    dObject: data[i]
                }
            };

            console.log(params.Item)
                //scan returns all the items of the list
            dataBaseClient.put(params, function(err, data) {
                console.log(data);

                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                }
            });

        }
    }
}


/**
 * [showAllItems description]
 * Show all the items of a given database
 * @param  {[type]} data [description]
 * @param  {[type]} table [description]
 * @return {[type]}      [description]
 */
exports.showAllItems = function(data, table) {

    if (typeof data !== 'undefined' && typeof table !== 'undefined') {

        var params = {
            TableName: table,
            ReturnConsumedCapacity: "TOTAL"
        };

        dataBaseClient.scan(params, function(err, data) {
            console.log(data);

            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            }
        });

    }
}
