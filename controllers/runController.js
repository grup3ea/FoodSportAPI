var express = require('express');
var app = express();
var runModel = require('../models/runModel');
var publicationModel = require('../models/publicationModel');
var userModel = require('../models/userModel');
//var trainerModel = require('../models/trainerModel');
var crypto = require('crypto');


/**POST '/publications' **/
exports.postRun = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'user not found.'});
        } else if (user) {
            //aquí ja hem agafat el user a partir del seu token
            var run = new runModel(req.body.newRun);
            run.user=user._id;
            //fins aquí tenim la variable publication amb els continguts
            //ara cal 1r guardar el model publication a la base de dades
            run.save(function (err, run) {
                if (err) return res.send(500, err.message);

                //i 2n, afegir la id de la publicació generada al user.publications
                user.runs.push(run._id);
                /* gamification */
                var reward = {
                    concept: "added new run to user",
                    date: Date(),
                    value: +1
                };
                user.points.history.push(reward);
                user.points.total = user.points.total + 1;
                /* end of gamification */
                user.save(function (err, user) {
                    if (err) return res.send(500, err.message);

                    //res.status(200).jsonp(user);
                    //ara farem una publicació ensenyant que ha fet aquest run
                    var publication = new publicationModel({
                        title: "new run '" + run.title + "'!",
                        content: "distance of: " + run.distance + ". View my runs at my profile",
                        date: new Date(),
                        user: user._id,
                        photo: "img/photoRun.png"
                    });
                    //fins aquí tenim la variable publication amb els continguts
                    //ara cal 1r guardar el model publication a la base de dades
                    publication.save(function (err, publication) {
                        if (err) return res.send(500, err.message);

                        //i 2n, afegir la id de la publicació generada al user.publications
                        user.publications.push(publication._id);
                        /* gamification */
                        var reward = {
                            concept: "added new publication to Timeline",
                            date: Date(),
                            value: +1
                        };
                        user.points.history.push(reward);
                        user.points.total = user.points.total + 1;
                        /* end of gamification */

                        if(!user.totalkm)
                        {
                            user.totalkm=0;
                        }
                        user.totalkm=user.totalkm + run.distance;
                        
                        user.save(function (err, user) {
                            if (err) return res.send(500, err.message);
                            res.status(200).jsonp(user);
                        });
                    });
                });
            });
        }//end else if
    });
};

/**GET '/users/:userid/publications' **/
exports.getRunsByUserId = function (req, res) {
    userModel.findOne({
        _id: req.params.userid
    })
    .populate('runs')
    .exec(function (error, user) {
        if (error !== null) res.send(500, error.message);

        res.status(200).jsonp(user);
    });
};
/** GET '/run/getById/:publicationid' **/
exports.getRunByRunId = function (req, res) {
    runModel.findOne({_id: req.params.runid})
        .lean()
        .populate('user', 'name avatar')
        .exec(function (err, run) {
            if (err) return res.send(500, err.message);
            if (!run) {
                res.json({success: false, message: 'run not found.'});
            } else if (run) {
                res.status(200).jsonp(run);
            }
        });
};
