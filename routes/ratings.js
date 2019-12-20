const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');
const errToJSON = require('error-to-json');
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

router.get('/:id', function(req, res, next) {
    const mode = req.query.mode;
    //On récupert seulement les futurs notes
    if(mode == "attente"){
        const query = "select * from kspace.ratings where user_id=? and rating = -1;";
        const params = [req.params.id];
        queryRunner.executeQueryWithPage(query,req.query.page,res,params);
    }
    //On récupert ceux déja noté
    else if(mode == "note"){
        const query = "select * from kspace.ratings where user_id=? and rating > 0 ALLOW FILTERING;";
        const params = [req.params.id];
        queryRunner.executeQueryWithPage(query,req.query.page,res,params);
    }
    //On récupert tout
    else{
        const query = "select * from kspace.ratings where user_id=?;";
        const params = [req.params.id];
        queryRunner.executeQueryWithPage(query,req.query.page,res,params);
    }
});

router.put('/', function(req, res, next) {
    const user_id = req.body.user_id;
    const movie_id = req.body.movie_id;
    const rating = req.body.rating;
    const actualise = req.query.actualise;

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
    const query = 'insert into kspace.ratings (user_id,movie_id,rating,timestamp) values (?,?,?,?);';
    const timestampNow = Date.now();
    const params = [user_id, movie_id, rating,timestampNow];
    if(actualise == "O"){
        const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id, rating: rating, timestamp:timestampNow}, actualise:true });
        queryRunner.executeQueryWithParamAndActualiseFilm(movie_id,query,params,res, returnString);

    }else{
        const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id, rating: rating, timestamp:timestampNow}, actualise:false });
        queryRunner.executeQueryWithParam(query,params,res, returnString);

    }
});

router.patch('/', function(req, res, next) {
    const user_id = req.body.user_id;
    const movie_id = req.body.movie_id;
    const rating = req.body.rating;
    const actualise = req.query.actualise;


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
    const query = 'Update kspace.ratings set rating=?,timestamp=? where user_id=? and movie_id=?;';
    const timestampNow = Date.now();
    const params = [rating,timestampNow, user_id, movie_id];
    if(actualise == "O"){
        const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id, rating: rating, timestamp:timestampNow}, actualise:true });
        queryRunner.executeQueryWithParamAndActualiseFilm(movie_id,query,params,res, returnString);

    }else {
        const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id, rating: rating, timestamp:timestampNow}, actualise:false });
        queryRunner.executeQueryWithParam(query,params,res, returnString);
    }
});

router.delete('/', function(req, res, next){
    const user_id = req.body.user_id;
    const movie_id = req.body.movie_id;
    const actualise = req.query.actualise;


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

    const query = 'delete from kspace.ratings where user_id=? and movie_id=?;';
    const params = [user_id,movie_id];
    if(actualise == "O"){
        const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id}, actualise:true});
        queryRunner.executeQueryWithParamAndActualiseFilm(movie_id,query,params,res, returnString);

    }else {
        const returnString = JSON.stringify({ query: query, param: {user_id : user_id, movie_id : movie_id}, actualise:false});
        queryRunner.executeQueryWithParam(query,params,res, returnString);
    }
});

module.exports = router;
