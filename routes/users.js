const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');
const errToJSON = require('error-to-json');

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

    const query = 'insert into kspace.users (userid,age,gender,occupation,occupationname,zipcode) values (now(),?,?,?,?,?);';
    const params = [age, gender,occupation,occupationname,zipcode];
    queryRunner.executeQueryWithParam(query,params,res);
});

module.exports = router;
