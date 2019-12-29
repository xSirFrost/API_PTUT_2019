const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');
const errToJSON = require('error-to-json')

router.get('/', async function(req, res, next) {
    const query = "select * from kspace.movies;";
    await queryRunner.executeQueryWithPage(query,req.query.page).then( result =>{
        res.send(result);
        res.end();
    },err =>{
        res.send(errToJSON(err));
        res.end();
    });
});

router.get('/:id', function(req, res, next) {
    const mode = req.query.mode;
    const actualise = req.query.actualise;
    let actualiseStr="";
    if(actualise=="0"){
        queryRunner.ActualiseFilm(req.params.id).then(
            result =>{
                if(result=="OK"){
                    actualiseStr="OK"
                }else{
                    actualiseStr="KO"
                }
            }
        )
    }
    if(mode=="all"){
        queryRunner.executeQueryWithParam('select * from kspace.movies where movie_id=?;', [req.params.id])
            .then( result =>{
            queryRunner.executeQueryWithParam("select * from kspace.crew where movie_id=?;", [req.params.id])
                .then( resultCrew =>{
                queryRunner.executeQueryWithParam("select * from kspace.cast where movie_id=?;", [req.params.id])
                    .then( resultCast =>{
                        result.rows[0]["cast"]= resultCast.rows;
                        result.rows[0]["crew"]= resultCrew.rows;
                        if(actualiseStr!="")
                            result.rows[0]["actualise"]= actualiseStr;
                        res.send(result);
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
    }else {
        const query = 'select * from kspace.movies where movie_id=?;';
        const params = [req.params.id];
        queryRunner.executeQueryWithParam(query, params).then( result =>{
            if(actualiseStr!="")
                result.rows[0]["actualise"]= actualiseStr;
            res.send(result);
            res.end();
        },err =>{
            res.send(errToJSON(err));
            res.end();
        });
    }
});

module.exports = router;
