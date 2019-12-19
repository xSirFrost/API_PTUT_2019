const assert = require('assert');
const cassandra = require('cassandra-driver');
const errToJSON = require('error-to-json')

const offset = 2;

function connection(){
    return new cassandra.Client({
        contactPoints: ['51.75.254.172'],
        localDataCenter: 'datacenter1'
    });
}

module.exports = {
    executeQuery : function(query,res) {
        try {
            //Connect
            const client = connection();
            const queryParam = query;

            //send
            client.connect(function (err) {
                if(err != undefined){
                    res.send(errToJSON(err));
                    return;
                }
                client.execute(queryParam, function (err, result) {
                    if(err != undefined){
                        res.send(errToJSON(err));
                        return;
                    }
                    if(result == undefined){
                        res.send("{}");
                        return;
                    }
                    res.send(result);
                    return;
                });
            });
        } catch (error) {
            res.send(errToJSON(error));
            return;
        }
    },
    executeQueryWithPage : function(query,res,paramPage) {
        try {
            //Connect
            const client = connection();
            let pageResult = [];

            //on met la page a 1 si c'est vide
            let page = 0;
            if (paramPage != null) {
                page = paramPage;
            }

            //send
            client.connect(function (err) {
                if(err != undefined){
                    res.send(errToJSON(err));
                    return;
                }
                client.eachRow(query, null, {prepare: true, autoPage: true}, function (n, row) {
                    if (n >= page * offset && n < offset + page * offset) {
                        pageResult.push(row);
                    }
                }, function callback(err, result) {
                    if(err != undefined){
                        res.send(errToJSON(err));
                        return;
                    }
                    if(pageResult == undefined){
                        res.send("{}");
                        return;
                    }
                    res.send(pageResult);
                    return;
                });

            });
        } catch (error) {
            res.send(errToJSON(error));
            return;
        }
    },
    executeQueryWithParam : function(query,param,res,resultString=undefined) {
        try {
            //Connect
            const client = connection();
            const queryString = query;

            //send
            client.connect(function (err) {
                if(err != undefined){
                    res.send(errToJSON(err));
                    return;
                }
                client.execute(queryString, param, { prepare: true },function (err, result) {
                    if(err != undefined){
                        res.send(errToJSON(err));
                        return;
                    }
                    if(result == undefined){
                        res.send("{}");
                        return;
                    }
                    if(resultString != undefined){
                        res.send(resultString);
                        return;
                    }
                    res.send(result);
                    return;
                });
            });
        } catch (error) {
            res.send(errToJSON(error));
            return;
        }
    }
};
