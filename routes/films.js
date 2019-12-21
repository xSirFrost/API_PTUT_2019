const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');

router.get('/', function(req, res, next) {
    const query = "select * from kspace.movies;";
    queryRunner.executeQueryWithPage(query,req.query.page,res);
});

router.get('/:id', function(req, res, next) {
    const mode = req.query.mode;
    if(mode=="all"){
        queryRunner.getFilmCrewCast(req.params.id,res);
    }else {
        const query = 'select * from kspace.movies where movie_id=?;';
        const params = [req.params.id];
        queryRunner.executeQueryWithParam(query, params, res);
    }
});

module.exports = router;
