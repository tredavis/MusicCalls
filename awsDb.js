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

    for (var i = 0; i < data.length; i++) {

        var params = {
            TableName: table,
            ReturnConsumedCapacity: "TOTAL",
            Item: {
                "trackId": { "N": i.toString() },
                "name": data[i].name
            }
        };

        //console.log(params)

        //scan returns all the items of the list
        dataBaseClient.putItem(params, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                //let's sending back to the callback function
                callBack(data);
            }
        });



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
