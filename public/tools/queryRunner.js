const cassandra = require('cassandra-driver');

const offset = 50;

function connection(){
    return new cassandra.Client({
        contactPoints: ['51.75.254.172'],
        localDataCenter: 'datacenter1'
    });
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
    }
};
