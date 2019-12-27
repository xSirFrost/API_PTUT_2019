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

function returnAndClose(res,client,send){
    if(res!=null){
        res.send(send);
        res.end();
    }
    if(client!=null){
        client.shutdown();
    }
}

module.exports = {
    executeQuery : async function(query,res) {
        //Connect
        const client = connection();
        const queryParam = query;

        //send
        await client.connect().then(async err =>{
            if(err != undefined){
                returnAndClose(res,client,errToJSON(err));
                return;
            }
            await client.execute(queryParam).then((err, result) => {
                if(err != undefined){
                    returnAndClose(res,client,errToJSON(err));
                    return;
                }
                if(result == undefined){
                    returnAndClose(res,client,"{}");
                    return;
                }
                returnAndClose(res,client,result);
                return;
            },err =>{
                returnAndClose(res,null,errToJSON(err));
                return;
            });
        },err =>{
            returnAndClose(res,null,errToJSON(err));
            return;
        });
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
                    returnAndClose(res,client,errToJSON(err));
                    return;
                }
                client.eachRow(query, param, {prepare: true, autoPage: true}, function (n, row) {
                    if (n >= pageParam * offset && n < offset + pageParam * offset) {
                        pageResult.push(row);
                    }
                }, function callback(err, result) {
                    if(err != undefined){
                        returnAndClose(res,client,errToJSON(err));
                        return;
                    }
                    if(pageResult == undefined){
                        returnAndClose(res,client,"{}");
                        return;
                    }
                    returnAndClose(res,client,pageResult);
                    return;
                });

            });
        } catch (err) {
            returnAndClose(res,null,errToJSON(err));
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
                    returnAndClose(res,client,errToJSON(err));
                    return;
                }
                client.execute(queryString, param, { prepare: true },function (err, result) {
                    if(err != undefined){
                        returnAndClose(res,client,errToJSON(err));
                        return;
                    }
                    if(result == undefined){
                        returnAndClose(res,client,"{}");
                        return;
                    }
                    if(resultString != undefined){
                        returnAndClose(res,client,resultString);
                        return;
                    }
                    returnAndClose(res,client,result);
                    return;
                });
            });
        } catch (err) {
            returnAndClose(res,null,errToJSON(err));
            return;
        }
    },
    executeQueryWithParamAndActualiseFilm : function(movie_id,query,param,res,resultString=undefined) {
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
                    returnAndClose(res,client,errToJSON(err));
                    return;
                }
                client.execute(queryString, param, { prepare: true },function (err, result) {
                    if(err != undefined){
                        returnAndClose(res,client,errToJSON(err));
                        return;
                    }
                    if(result == undefined){
                        returnAndClose(res,client,(errToJSON(new Error("Action en echec car le résultat est vide"))));
                        return;
                    }
                    if(resultString != undefined){
                        //Si on a bien pu faire l'action, on récupert le nombre d'user
                        client.shutdown;
                        client = connection();
                        client.connect(function (err) {
                            if(err != undefined){
                                returnAndClose(res,client,(errToJSON(err)));
                                return;
                            }
                            client.execute("select count(*) as \"popularity\" from kspace.users;", function (err, result2) {
                                if (err != undefined) {
                                    returnAndClose(res,client,(errToJSON(err)));
                                    return;
                                }
                                if (result2 == undefined) {
                                    returnAndClose(res,client,(errToJSON(new Error("Récuperation du nombre total d'utilisateur en echec"))));
                                    return;
                                }
                                //Si on a bien récuperer le nombre d'user, on récupert le nombre et moyenne de vote
                                client.shutdown;
                                if (result2.rows[0]["popularity"] == undefined) {
                                    returnAndClose(res,client,(errToJSON(new Error("Récuperation du nombre total d'utilisateur en echec"))));
                                    return;
                                }
                                popularity = parseInt(result2.rows[0]["popularity"].toString());
                                client = connection();
                                client.connect(function (err) {
                                    if(err != undefined){
                                        returnAndClose(res,client,(errToJSON(err)));
                                        return;
                                    }
                                    client.execute("select avg(rating) as averageNote,count(rating) as countNote from kspace.ratings where movie_id = ?;", [movie_id], {prepare: true}, function (err, result3) {
                                        if (err != undefined) {
                                            returnAndClose(res,client,errToJSON(err));
                                            return;
                                        }
                                        if (result3 == undefined) {
                                            returnAndClose(res,client,errToJSON(new Error("Récuperation du nombre de vote et de la moyenne en echec")));
                                            return;
                                        }
                                        //Si on a tout bien recuperer, on actualise film
                                        client.shutdown;
                                        if (result3.rows[0]["averagenote"] == undefined) {
                                            returnAndClose(res,client,errToJSON(new Error("Recuperation de la note moyenne en echec")));
                                            return;
                                        }
                                        average = parseFloat(result3.rows[0]["averagenote"].toString());
                                        if (result3.rows[0]["countnote"] == undefined) {
                                            returnAndClose(res,client,errToJSON(new Error("Recupereation du nombre de vote en echec")));
                                            return;
                                        }
                                        count = parseInt(result3.rows[0]["countnote"].toString());
                                        client = connection();
                                        client.connect(function (err) {
                                            if(err != undefined){
                                                returnAndClose(res,client,errToJSON(err));
                                                return;
                                            }
                                            client.execute("update kspace.movies set popularity=?,vote_average=?,vote_count=? where movie_id=?;", [(count/popularity*100), average, count, movie_id], {prepare: true}, function (err, result4) {
                                                if (err != undefined) {
                                                    returnAndClose(res,client,errToJSON(err));
                                                    return;
                                                }
                                                if (result4 == undefined) {
                                                    returnAndClose(res,client,errToJSON(new Error("Actualisation du film en echec")));
                                                    return;
                                                }
                                                //On envoie le paramètre sauf si on a bien un result string
                                                if (resultString != undefined) {
                                                    returnAndClose(res,client,resultString);
                                                    return;
                                                }
                                                returnAndClose(res,client,result);
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
            returnAndClose(res,null,errToJSON(error));
            return;
        }
    },
    getFilmCrewCast : function(movie_id,res){
        try {
            //Connect
            let client = connection();
            //send
            client.connect(function (err) {
                if(err != undefined){
                    returnAndClose(res,client,errToJSON(err));
                    return;
                }
                client.execute("select * from kspace.movies where movie_id=?;", [movie_id], { prepare: true },function (err, result) {
                    if(err != undefined){
                        returnAndClose(res,client,"{}");
                        return;
                    }
                    if(result == undefined){
                        returnAndClose(res,client,"{}");
                        return;
                    }
                    //Si on a bien pu faire l'action, on récupert le crew
                    client.shutdown;
                    let resultReturn = result;
                    client = connection();
                    client.connect(function (err) {
                        if(err != undefined){
                            returnAndClose(res,client,errToJSON(err));
                            return;
                        }
                        client.execute("select * from kspace.crew where movie_id=?;", [movie_id], { prepare: true }, function (err, result2) {
                            if (err != undefined) {
                                returnAndClose(res,client,errToJSON(err));
                                return;
                            }
                            if (result2 == undefined) {
                                resultReturn.rows[0]["crew"]= "{}";
                            }else{
                                resultReturn.rows[0]["crew"]= result2.rows;
                            }
                            //mnt on récupert le cast
                            client.shutdown;
                            client = connection();
                            client.connect(function (err) {
                                if(err != undefined){
                                    returnAndClose(res,client,errToJSON(err));
                                    return;
                                }
                                client.execute("select * from kspace.cast where movie_id=?;", [movie_id], {prepare: true}, function (err, result3) {
                                    if (err != undefined) {
                                        returnAndClose(res,client,errToJSON(err));
                                        return;
                                    }
                                    if (result3 == undefined) {
                                        resultReturn.rows[0]["cast"]= "{}";
                                    }else{
                                        resultReturn.rows[0]["cast"]= result3.rows;
                                    }
                                    returnAndClose(res,client,resultReturn);
                                    return;
                                });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            rreturnAndClose(res,null,errToJSON(error));
            return;
        }
    }
};
