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
    }, executeQueryWithParamAndActualiseFilm : function(movie_id,query,param,res,resultString=undefined) {
        try {
            //Connect
            let client = connection();
            const queryString = query;

            let popularity = 0;
            let average = 0;
            let count = 0;

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
                        res.send(errToJSON(new Error("Action en echec car le résultat est vide")));
                        client.shutdown();
                        res.end();
                        return;
                    }
                    if(resultString != undefined){
                    //Si on a bien pu faire l'action, on récupert le nombre d'user
                        client.shutdown;
                        client = connection();
                        client.connect(function (err) {
                            if(err != undefined){
                                res.send(errToJSON(err));
                                client.shutdown();
                                res.end();
                                return;
                            }
                            client.execute("select count(*) as \"popularity\" from kspace.users;", function (err, result2) {
                                if (err != undefined) {
                                    res.send(errToJSON(err));
                                    client.shutdown();
                                    res.end();
                                    return;
                                }
                                if (result2 == undefined) {
                                    res.send(errToJSON(new Error("Récuperation du nombre total d'utilisateur en echec")));
                                    client.shutdown();
                                    res.end();
                                    return;
                                }
                                //Si on a bien récuperer le nombre d'user, on récupert le nombre et moyenne de vote
                                client.shutdown;
                                if (result2.rows[0]["popularity"] == undefined) {
                                    res.send(errToJSON(new Error("Récuperation du nombre total d'utilisateur en echec")));
                                    client.shutdown();
                                    res.end();
                                    return;
                                }
                                popularity = parseInt(result2.rows[0]["popularity"].toString());
                                client = connection();
                                client.connect(function (err) {
                                    if(err != undefined){
                                        res.send(errToJSON(err));
                                        client.shutdown();
                                        res.end();
                                        return;
                                    }
                                    client.execute("select avg(rating) as averageNote,count(rating) as countNote from kspace.ratings where movie_id = ?;", [movie_id], {prepare: true}, function (err, result3) {
                                        if (err != undefined) {
                                            res.send(errToJSON(err));
                                            client.shutdown();
                                            res.end();
                                            return;
                                        }
                                        if (result3 == undefined) {
                                            res.send(errToJSON(new Error("Récuperation du nombre de vote et de la moyenne en echec")));
                                            client.shutdown();
                                            res.end();
                                            return;
                                        }
                                        //Si on a tout bien recuperer, on actualise film
                                        client.shutdown;
                                        if (result3.rows[0]["averagenote"] == undefined) {
                                            res.send(errToJSON(new Error("Recuperation de la note moyenne en echec")));
                                            client.shutdown();
                                            res.end();
                                            return;
                                        }
                                        average = parseFloat(result3.rows[0]["averagenote"].toString());
                                        if (result3.rows[0]["countnote"] == undefined) {
                                            res.send(errToJSON(new Error("Recupereation du nombre de vote en echec")));
                                            client.shutdown();
                                            res.end();
                                            return;
                                        }
                                        count = parseInt(result3.rows[0]["countnote"].toString());
                                        client = connection();
                                        client.connect(function (err) {
                                            if(err != undefined){
                                                res.send(errToJSON(err));
                                                client.shutdown();
                                                res.end();
                                                return;
                                            }
                                            client.execute("update kspace.movies set popularity=?,vote_average=?,vote_count=? where movie_id=?;", [(count/popularity*100), average, count, movie_id], {prepare: true}, function (err, result4) {
                                                if (err != undefined) {
                                                    res.send(errToJSON(err));
                                                    client.shutdown();
                                                    res.end();
                                                    return;
                                                }
                                                if (result4 == undefined) {
                                                    res.send(errToJSON(new Error("Actualisation du film en echec")));
                                                    client.shutdown();
                                                    res.end();
                                                    return;
                                                }
                                                //On envoie le paramètre sauf si on a bien un result string
                                                if (resultString != undefined) {
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
                                    });
                                });
                            });
                        });
                    }
                });
            });
        } catch (error) {
            res.send(errToJSON(error));
            res.end();
            return;
        }
    }
};
