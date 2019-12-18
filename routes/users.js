const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');

router.get('/:id', function(req, res, next) {
    const query = "select * from kspace.users where userid="+req.params.id+";";
    console.log(query);
    queryRunner.executeQuery(query,res);
});


router.put('/:id', function(req, res, next) {
    console.log(req.body);
    const body = JSON.parse(req.body);
    console.log(body);
});

module.exports = router;
