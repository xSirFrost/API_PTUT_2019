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
    executeQuery : async function(query) {
        return new Promise(async(resolve, reject) => {
            try {
                //Connect
                const client = connection();
                const queryParam = query;

                //send
                await client.connect().then(async () => {
                    await client.execute(queryParam).then((result) => {
                        if (result == undefined) {
                            client.shutdown();
                            resolve("{}");
                            return;
                        }
                        client.shutdown();
                        resolve(result);
                        return;
                    }, err => {
                        client.shutdown();
                        reject(err);
                        return;
                    });
                }, err => {
                    reject(err);
                    return;
                });
            }catch (err) {
                reject(err);
                return;
            }
        });
    },
    executeQueryWithPage : async function(query,page,param = null) {
        return new Promise(async(resolve, reject) => {
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
                await client.connect().then(async () => {
                    await client.eachRow(query, param, {prepare: true, autoPage: true}, function (n, row) {
                        if (n >= pageParam * offset && n < offset + pageParam * offset) {
                            pageResult.push(row);
                        }
                    }, function callback(err) {
                        if (err != undefined) {
                            reject(err);
                            return;
                        }
                        if (pageResult == undefined) {
                            resolve("{}");
                            return;
                        }
                        resolve(pageResult);
                        return;
                    });

                }, err => {
                    reject(err);
                    return;
                });
            } catch (err) {
                reject(err);
                return;
            }
        });
    },
    executeQueryWithParam : async function(query,param) {
        return new Promise(async(resolve, reject) => {
            try {
                //Connect
                const client = connection();
                const queryString = query;

                //send
                await client.connect().then(async () => {
                    client.execute(queryString, param, {prepare: true}).then((result) => {
                        if (result == undefined) {
                            client.shutdown();
                            resolve("{}");
                            return;
                        }
                        client.shutdown();
                        resolve(result);
                        return;
                    }, err => {
                        client.shutdown();
                        reject(err);
                        return;
                    });
                }, err => {
                    reject(err);
                    return;
                });
            }catch (err) {
                reject(err);
                return;
            }
        });
    },
    ActualiseFilm : async function(movie_id) {
        return new Promise(async(resolve, reject) => {
            try {
                let popularity = 0;
                let average = 0;
                let count = 0;
                this.executeQuery("select count(*) as popularity from kspace.users;").then
                (resultPopularity => {
                    if(resultPopularity=="{}" || resultPopularity.rows[0]["popularity"] == undefined) {
                        reject(new Error("Récuperation du nombre total d'utilisateur en echec"));
                        return;
                    }else{
                        popularity = parseInt(resultPopularity.rows[0]["popularity"].toString());
                        this.executeQueryWithParam("select avg(rating) as averageNote,count(rating) as countNote from kspace.ratings where movie_id = ? and rating > 0 ALLOW FILTERING;",[movie_id]).then
                        (resultRating => {
                            if(resultRating=="{}" || resultRating.rows[0]["averagenote"] == undefined || resultRating.rows[0]["countnote"] == undefined) {
                                reject(new Error("Récuperation du nombre de vote et de la moyenne en echec"));
                                return;
                            }else{
                                count = parseInt(resultRating.rows[0]["countnote"].toString());
                                average = parseFloat(resultRating.rows[0]["averagenote"].toString());
                                this.executeQueryWithParam("update kspace.movies set popularity=?,vote_average=?,vote_count=? where movie_id=?;", [(count/popularity*100), average, count, movie_id]).then
                                (resultAll => {
                                    resolve("OK")
                                    return;
                                }, err => {
                                    reject(new Error("Actualisation du film en echec"));
                                    return;
                                });
                            }
                        }, err => {
                            reject(new Error("Récuperation du nombre de vote et de la moyenne en echec"));
                            return;
                        });
                    }
                }, err => {
                    reject(new Error("Récuperation du nombre total d'utilisateur en echec"));
                    return;
                });
            } catch (error) {
                reject(error);
                return;
            }
        });
    }
};
