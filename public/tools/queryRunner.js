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
                    client.shutdown();
                    res.end();
                    return;
                }
                client.execute(queryParam, function (err, result) {
                    if(err != undefined){
                        res.send(errToJSON(err));
                        client.shutdown();
                        res.end();
                        return;
                    }
                    if(result == undefined){
                        res.send("{}");
                        client.shutdown();
                        res.end();
                        return;
                    }
                    res.send(result);
                    client.shutdown();
                    res.end();
                    return;
                });
            });
        } catch (error) {
            res.send(errToJSON(error));
            res.end();
            return;
        }
    },
    executeQueryWithPage : function(query,page,res,param = null) {
        try {
            //Connect
            const client = connection();
            let pageResult = [];

            //on met la page a 1 si c'est vide
            let pageParam = 0;
            if (page != null) {
                pageParam = page;
            }

            //send
            client.connect(function (err) {
                if(err != undefined){
                    res.send(errToJSON(err));
                    client.shutdown();
                    res.end();
                    return;
                }
                client.eachRow(query, param, {prepare: true, autoPage: true}, function (n, row) {
                    if (n >= pageParam * offset && n < offset + pageParam * offset) {
                        pageResult.push(row);
                    }
                }, function callback(err, result) {
                    if(err != undefined){
                        res.send(errToJSON(err));
                        client.shutdown();
                        res.end();
                        return;
                    }
                    if(pageResult == undefined){
                        res.send("{}");
                        client.shutdown();
                        res.end();
                        return;
                    }
                    res.send(pageResult);
                    client.shutdown();
                    res.end();
                    return;
                });

            });
        } catch (error) {
            res.send(errToJSON(error));
            res.end();
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
                    client.shutdown();
                    res.end();
                    return;
                }
                client.execute(queryString, param, { prepare: true },function (err, result) {
                    if(err != undefined){
                        res.send(errToJSON(err));
                        client.shutdown();
                        res.end();
                        return;
                    }
                    if(result == undefined){
                        res.send("{}");
                        client.shutdown();
                        res.end();
                        return;
                    }
                    if(resultString != undefined){
                        res.send(resultString);
                        client.shutdown();
                        res.end();
                        return;
                    }
                    res.send(result);
                    client.shutdown();
                    res.end();
                    return;
                });
            });
        } catch (error) {
            res.send(errToJSON(error));
            res.end();
            return;
        }
    }
};
