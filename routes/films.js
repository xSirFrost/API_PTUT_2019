const express = require('express');
const router = express.Router();
const queryRunner = require('./../public/tools/queryRunner');
const errToJSON = require('error-to-json')
const http = require('http');

router.get('/', async function(req, res, next) {
    http.get('http://localhost:55555/movies',(resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                res.send(data);
                res.end();
            });
        }).on("error", (err) => {
        res.send(errToJSON(err));
        res.end();
    });
    // const query = "select * from kspace3.movies;";
    // await queryRunner.executeQueryWithPage(query,req.query.page).then( result =>{
    //     res.send(result);
    //     res.end();
    // },err =>{
    //     res.send(errToJSON(err));
    //     res.end();
    // });
});

router.get('/:id', function(req, res, next) {
    const mode = req.query.mode;
    const update = req.query.update;
    let updateStr="";
    if(update=="Y"){
        queryRunner.ActualiseFilm(req.params.id).then(
            result =>{
                if(result=="OK"){
                    updateStr="OK"
                }else{
                    updateStr="KO"
                }
            }
        )
    }
    if(mode=="all"){
        queryRunner.executeQueryWithParam('select * from kspace3.movies where movie_id=?;', [req.params.id])
            .then( result =>{
            queryRunner.executeQueryWithParam("select * from kspace3.crew where movie_id=?;", [req.params.id])
                .then( resultCrew =>{
                queryRunner.executeQueryWithParam("select * from kspace3.cast where movie_id=?;", [req.params.id])
                    .then( resultCast =>{
                        result.rows[0]["cast"]= resultCast.rows;
                        result.rows[0]["crew"]= resultCrew.rows;
                        if(updateStr!="")
                            result.rows[0]["update"]= updateStr;
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
        const query = 'select * from kspace3.movies where movie_id=?;';
        const params = [req.params.id];
        queryRunner.executeQueryWithParam(query, params).then( result =>{
            if(updateStr!="")
                result.rows[0]["update"]= updateStr;
            res.send(result);
            res.end();
        },err =>{
            res.send(errToJSON(err));
            res.end();
        });
    }
});

module.exports = router;
