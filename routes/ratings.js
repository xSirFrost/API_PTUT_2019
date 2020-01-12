const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');
const errToJSON = require('error-to-json');
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

router.get('/', function(req, res, next) {
    const mode = req.query.mode;
    const user_id = Uuid.fromString(req.query.user_id);
    if(user_id == undefined){
        res.send(errToJSON(new Error("User_id non renseigné")));
        res.end();
        return;
    }
    //On récupert les films correspondant à l'id
    const query = "select * from kspace3.movies where ratings contains key ? allow filtering;";
    const params = [user_id];
    queryRunner.executeQueryWithPage(query, req.query.page, params).then
    (result => {
        if(result.length==0){
            res.send(result);
            res.end();
            return;
        }
        result.forEach(row =>{
            row["recherchegenres"]=null;
            row["recherchecast"]=null;
            row["recherchecredits"]=null;
            row["ratings"]= row["ratings"][user_id];
        });
        let resultSend = [];
        if(mode == "later") {
            result.forEach(row =>{
                if(row["ratings"]==-1){
                    resultSend.push(row);
                }
            });
            res.send(resultSend);
            res.end();
        }else if(mode == "noted") {
            result.forEach(row =>{
                if(row["ratings"]!=-1){
                    resultSend.push(row);
                }
            });
            res.send(resultSend);
            res.end();
        }else{
            res.send(result);
            res.end();
        }

    }, err => {
        res.send(errToJSON(err));
        res.end();
    });
});

router.put('/', function(req, res, next) {
    const user_id = req.body.user_id;
    const movie_id = req.body.movie_id;
    const rating = req.body.rating;

    if(user_id == undefined){
        res.send(errToJSON(new Error("User_id non renseigné")));
        res.end();
        return;
    }

    if(movie_id == undefined){
        res.send(errToJSON(new Error("Movie_id non renseigné")));
        res.end();
        return;
    }

    if(rating == undefined){
        res.send(errToJSON(new Error("Rating non renseigné")));
        res.end();
        return;
    }
    const queryGetFilms = 'select * from kspace3.movies where movie_id= ?';
    const paramGetFilms = [Uuid.fromString(movie_id)]
        queryRunner.executeQuery("select count(*) as popularity from kspace3.users;").then
        ( resultPopularity =>{
            let popularity = parseInt(resultPopularity.rows[0]["popularity"].toString());
            queryRunner.executeQueryWithParam(queryGetFilms,paramGetFilms).then
            ( resultFilm =>{
                let ratings = {};
                if(resultFilm.rows[0]["ratings"] != null)
                    ratings = resultFilm.rows[0]["ratings"]
                ratings = Object.assign({},ratings,{[Uuid.fromString(user_id)] : rating});
                let count = Object.values(ratings).length;
                let average = 0;
                Object.values(ratings).forEach(rate =>{
                    average += rate;
                })
                average = average/count;
                const query = 'update kspace3.movies set ratings=?, popularity=?,vote_average=?,vote_count=? where movie_id= ?;';
                const params = [ratings,(count/popularity*100), average, count, Uuid.fromString(movie_id)];
                const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id, rating: rating}, update:true });
                queryRunner.executeQueryWithParam(query,params).then
                ( result =>{
                    res.send(returnString);
                    res.end();
                },err =>{
                    res.send(errToJSON(err));
                    res.end();
                });
            },err =>{
                res.send(errToJSON(err));
                res.end();
            });
        },err =>{
            res.send(errToJSON(err));
            res.end();
        });
});

router.patch('/', function(req, res, next) {
    const user_id = req.body.user_id;
    const movie_id = req.body.movie_id;
    const rating = req.body.rating;

    if(user_id == undefined){
        res.send(errToJSON(new Error("User_id non renseigné")));
        res.end();
        return;
    }

    if(movie_id == undefined){
        res.send(errToJSON(new Error("Movie_id non renseigné")));
        res.end();
        return;
    }

    if(rating == undefined){
        res.send(errToJSON(new Error("Rating non renseigné")));
        res.end();
        return;
    }
    const queryGetFilms = 'select * from kspace3.movies where movie_id= ?';
    const paramGetFilms = [Uuid.fromString(movie_id)]
    queryRunner.executeQuery("select count(*) as popularity from kspace3.users;").then
    ( resultPopularity =>{
        let popularity = parseInt(resultPopularity.rows[0]["popularity"].toString());
        queryRunner.executeQueryWithParam(queryGetFilms,paramGetFilms).then
        ( resultFilm =>{
            let ratings = {};
            if(resultFilm.rows[0]["ratings"] != null)
                ratings = resultFilm.rows[0]["ratings"]
            ratings = Object.assign({},ratings,{[Uuid.fromString(user_id)] : rating});
            let count = Object.values(ratings).length;
            let average = 0;
            Object.values(ratings).forEach(rate =>{
                average += rate;
            })
            average = average/count;
            const query = 'update kspace3.movies set ratings=?, popularity=?,vote_average=?,vote_count=? where movie_id= ?;';
            const params = [ratings,(count/popularity*100), average, count, Uuid.fromString(movie_id)];
            const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id, rating: rating}, update:true });
            queryRunner.executeQueryWithParam(query,params).then
            ( result =>{
                res.send(returnString);
                res.end();
            },err =>{
                res.send(errToJSON(err));
                res.end();
            });
        },err =>{
            res.send(errToJSON(err));
            res.end();
        });
    },err =>{
        res.send(errToJSON(err));
        res.end();
    });
});

router.delete('/', function(req, res, next){
    const user_id = req.body.user_id;
    const movie_id = req.body.movie_id;

    if(user_id == undefined){
        res.send(errToJSON(new Error("User_id non renseigné")));
        res.end();
        return;
    }

    if(movie_id == undefined){
        res.send(errToJSON(new Error("Movie_id non renseigné")));
        res.end();
        return;
    }
    const queryGetFilms = 'select * from kspace3.movies where movie_id= ?';
    const paramGetFilms = [Uuid.fromString(movie_id)]
    queryRunner.executeQuery("select count(*) as popularity from kspace3.users;").then
    ( resultPopularity =>{
        let popularity = parseInt(resultPopularity.rows[0]["popularity"].toString());
        queryRunner.executeQueryWithParam(queryGetFilms,paramGetFilms).then
        ( resultFilm =>{
            let ratings = {};
            if(resultFilm.rows[0]["ratings"] != null)
                ratings = resultFilm.rows[0]["ratings"]
            let count = Object.values(ratings).length;
            let average = 0;
            Object.values(ratings).forEach(rate =>{
                average += rate;
            })
            average = average/count;
            const query = 'DELETE ratings[?] from kspace3.movies where movie_id= ?;';
            const params = [Uuid.fromString(user_id), Uuid.fromString(movie_id)];
            const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id}, update:true });
            queryRunner.executeQueryWithParam(query,params).then
            ( result =>{
                res.send(returnString);
                res.end();
            },err =>{
                res.send(errToJSON(err));
                res.end();
            });
        },err =>{
            res.send(errToJSON(err));
            res.end();
        });
    },err =>{
        res.send(errToJSON(err));
        res.end();
    });
});

module.exports = router;
