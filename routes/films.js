const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');

router.get('/', function(req, res, next) {
    const query = "select * from kspace.movies;";
    console.log(query);
    queryRunner.executeQueryWithPage(query,res,req.query.page);
});

router.get('/:id', function(req, res, next) {
    const query = "select * from kspace.movies where movie_id="+req.params.id+";";
    console.log(query);
    queryRunner.executeQuery(query,res);
});

module.exports = router;
