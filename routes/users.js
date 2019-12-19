const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');
const errToJSON = require('error-to-json');
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

router.get('/:id', function(req, res, next) {
    const query = "select * from kspace.users where userid="+req.params.id+";";
    console.log(query);
    queryRunner.executeQuery(query,res);
});


router.put('/', function(req, res, next) {
    const age = req.body.age;
    const gender = req.body.gender;
    const occupation = req.body.occupation;
    const occupationname = req.body.occupationname;
    const zipcode = req.body.zipcode;

    if(age == undefined){
        res.send(errToJSON(new Error("Age non renseigné")));
        return;
    }
    if(gender == undefined){
        res.send(errToJSON(new Error("gender non renseigné")));
        return;
    }
    if(occupation == undefined){
        res.send(errToJSON(new Error("occupation non renseigné")));
        return;
    }
    if(occupationname == undefined){
        res.send(errToJSON(new Error("occupationname non renseigné")));
        return;
    }
    if(zipcode == undefined){
        res.send(errToJSON(new Error("zipcode non renseigné")));
        return;
    }

    const uuidRandom = Uuid.random();
    const query = 'insert into kspace.users (userid,age,gender,occupation,occupationname,zipcode) values (?,?,?,?,?,?);';
    const params = [uuidRandom, age, gender,occupation,occupationname,zipcode];
    const returnString = JSON.stringify({ query: query, param: {userid : uuidRandom, age : age, gender: gender, occupation: occupation, occupationname : occupationname, zipcode : zipcode } });
    queryRunner.executeQueryWithParam(query,params,res, returnString);
});

router.patch('/', function(req, res, next){
    const userid = req.body.userid
    const age = req.body.age;
    const gender = req.body.gender;
    const occupation = req.body.occupation;
    const occupationname = req.body.occupationname;
    const zipcode = req.body.zipcode;

    if(userid == undefined){
        res.send(errToJSON(new Error("Userid non renseigné")));
        return;
    }
    if(age == undefined){
        res.send(errToJSON(new Error("Age non renseigné")));
        return;
    }
    if(gender == undefined){
        res.send(errToJSON(new Error("gender non renseigné")));
        return;
    }
    if(occupation == undefined){
        res.send(errToJSON(new Error("occupation non renseigné")));
        return;
    }
    if(occupationname == undefined){
        res.send(errToJSON(new Error("occupationname non renseigné")));
        return;
    }
    if(zipcode == undefined){
        res.send(errToJSON(new Error("zipcode non renseigné")));
        return;
    }

    const query = 'Update kspace.users set age=?,gender=?,occupation=?,occupationname=?,zipcode=? where userid=?;';
    const params = [age, gender,occupation,occupationname,zipcode,userid];
    const returnString = JSON.stringify({ query: query, param: {userid : userid, age : age, gender: gender, occupation: occupation, occupationname : occupationname, zipcode : zipcode } });
    queryRunner.executeQueryWithParam(query,params,res, returnString);
});

router.delete('/', function(req, res, next){
    const userid = req.body.userid

    if(userid == undefined){
        res.send(errToJSON(new Error("Userid non renseigné")));
        return;
    }

    const query = 'delete from kspace.users where userid=?;';
    const params = [userid];
    const returnString = JSON.stringify({ query: query, param: {userid : userid}});
    queryRunner.executeQueryWithParam(query,params,res, returnString);
});


module.exports = router;
