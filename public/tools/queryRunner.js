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
                }
                return client.execute(queryParam, function (err, result) {
                    if(err != undefined){
                        return res.send(errToJSON(err));
                    }
                    if(result == undefined){
                        res.send("{}");
                    }
                    res.send(result);
                });
            });
        } catch (error) {
            res.send(errToJSON(error));
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
                }
                client.eachRow(query, null, {prepare: true, autoPage: true}, function (n, row) {
                    if (n >= page * offset && n < offset + page * offset) {
                        pageResult.push(row);
                    }
                }, function callback(err, result) {
                    if(err != undefined){
                        return res.send(errToJSON(err));
                    }
                    if(pageResult == undefined){
                        res.send("{}");
                    }
                    res.send(pageResult);
                });

            });
        } catch (error) {
            return res.send(errToJSON(error));
        }
    }
};
