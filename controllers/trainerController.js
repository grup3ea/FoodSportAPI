var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var crypto = require('crypto');

app.set('superSecret', config.secret);

/*******MODELS*********/
//var trainerModel = require('../models/trainerModel');
var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');
var routineModel = require('../models/routineModel');

/** GET '/trainers' **/
exports.getTrainers = function (req, res) {
    userModel.find({role: 'trainer'})
        .limit(Number(req.query.pageSize))
        .skip(Number(req.query.pageSize)*Number(req.query.page))
        .exec(function (err, trainers) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(trainers);
        });
};
exports.getTrainersByDisciplinesArray = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'sending petition failed. user not found.'});
        } else if (user) {
            if(user.disciplines[0])
            {
                userModel.find({
                        role: 'trainer',
                        $and: [
                            {_id: { $nin: user._id}},
                            {_id: { $nin: user.trainers}}
                        ],
                        'disciplines.name': user.disciplines[0].name//per ara torna els trainers que tinguin la discipline[0] del user client
                    })
                    .limit(Number(req.query.pageSize))
                    .skip(Number(req.query.pageSize)*Number(req.query.page))
                    .exec(function (err, trainers) {
                        if (err) return res.send(500, err.message);
                        res.status(200).jsonp(trainers);
                    });
            }else{
                userModel.find({
                        role: 'trainer',
                        $and: [
                            {_id: { $nin: user._id}},
                            {_id: { $nin: user.trainers}}
                        ]
                    })
                    .limit(Number(req.query.pageSize))
                    .skip(Number(req.query.pageSize)*Number(req.query.page))
                    .exec(function (err, trainers) {
                        if (err) return res.send(500, err.message);
                        res.status(200).jsonp(trainers);
                    });
            }

        }
    });
};

/** GET '/trainers/:trainerid' **/
exports.getTrainerById = function (req, res) {
    userModel.findOne({_id: req.params.trainerid, role: 'trainer'})
        .lean()
        .populate('routines', 'title description')
        .populate('clients.client', 'name avatar points')
        .populate('clientsPetitions.clientid', 'name avatar')
        .exec(function (err, trainer) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(trainer);
        });
};

/** GET '/trainers/searchByDiscipline' **/
exports.searchByDiscipline = function (req, res) {
    userModel.find({'disciplines.name': req.params.discipline, role: 'trainer'})
        .limit(Number(req.query.pageSize))
        .skip(Number(req.query.pageSize)*Number(req.query.page))
        .exec(function (err, trainers) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(trainers);
        });
};

/** POST '/trainers/register' **/
exports.register = function (req, res) {
    var trainer = new userModel({
        name: req.body.name,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        avatar: 'img/user.png',
        background: 'img/background.png',
        role: req.body.role,
        discipline: req.body.discipline,
        points: {
            total: 0
        }
    });
    /* gamification */
    var reward = {
        concept: "account created",
        date: Date(),
        value: +1
    };
    trainer.points.history.push(reward);
    trainer.points.total = trainer.points.total + 1;
    /* end of gamification */
    trainer.save(function (err, trainer) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(trainer);
    });
};

/** POST '/trainers/login' **/
exports.login = function (req, res) {
    userModel.findOne({
        email: req.body.email, role: 'trainer'
    })
    .select('+password')
    .exec(function (err, trainer) {
        if (err) throw err;
        if (!trainer) {
            res.json({success: false, message: 'Authentication failed. trainer not found.'});
        } else if (trainer) {
            req.body.password = crypto.createHash('sha256').update(req.body.password).digest('base64');
            if (trainer.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
                var indexToken = -1;
                for (var i = 0; i < trainer.tokens.length; i++) {
                    if (trainer.tokens[i].userAgent == req.body.userAgent) {
                        indexToken = JSON.parse(JSON.stringify(i));
                    }
                }
                console.log(indexToken);
                if (indexToken == -1) {//userAgent no exist

                    var tokenGenerated = jwt.sign({foo: 'bar'}, app.get('superSecret'), {
                        //  expiresIn: 86400 // expires in 24 hours
                    });
                    var newToken = {
                        userAgent: req.body.userAgent,
                        token: tokenGenerated,
                        os: req.body.os,
                        browser: req.body.browser,
                        device: req.body.device,
                        os_version: req.body.os_version,
                        browser_version: req.body.browser_version,
                        ip: req.body.ip,
                        lastLogin: Date()
                    };
                    trainer.tokens.push(newToken);
                } else {//userAgent already exist
                    trainer.tokens[indexToken].token = "";

                    var tokenGenerated = jwt.sign({foo: 'bar'}, app.get('superSecret'), {
                        //  expiresIn: 86400 // expires in 24 hours
                    });
                    trainer.tokens[indexToken].token = tokenGenerated;
                    trainer.tokens[indexToken].ip = req.body.ip;
                    trainer.tokens[indexToken].lastLogin = Date();
                }
                trainer.save(function (err, trainer) {
                    if (err) return res.send(500, err.message);

                    // return the information including token as JSON
                    trainer.password = "";
                    res.json({
                        user: trainer,
                        success: true,
                        message: 'Enjoy your token!',
                        token: tokenGenerated
                    });
                });
            }
        }
    });
};

/** POST '/trainers/acceptClientPetition' **/
exports.acceptClientPetition = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token'], role: 'trainer'}, function (err, trainer) {
        if (err) return res.send(500, err.message);
        if (!trainer) {
            res.json({success: false, message: 'adding client to trainer failed. trainer not found.'});
        } else if (trainer) {
            console.log(trainer);//aquí potser caldria comprovar que la routine és la que han creat per l'trainer
            //busquem la petition que estem processant
            for (var i = 0; i < trainer.clientsPetitions.length; i++) //routine.days
            {
                if (trainer.clientsPetitions[i]._id.equals(req.body.petitionid)) {
                    var newClient = {
                        client: trainer.clientsPetitions[i].clientid,
                        petitionMessage: trainer.clientsPetitions[i].message,
                        date: Date()
                    };
                    trainer.clients.push(newClient);

                    //la petició la marco com a accepted
                    trainer.clientsPetitions[i].state = "accepted";
                    trainer.save(function (err) {
                        if (err) return res.send(500, err.message);

                        userModel.findOne({_id: trainer._id, role: 'trainer'})
                            .lean()
                            .populate('routines', 'title description')
                            .populate('clients.client', 'name avatar points')
                            .populate('clientsPetitions.clientid', 'name avatar')
                            .exec(function (err, trainer) {
                                if (err) return res.send(500, err.message);
                                res.status(200).jsonp(trainer);
                            });
                    });
                    //ara afegim el trainer al user.trainer
                    userModel.findOne({'_id': trainer.clientsPetitions[i].clientid}, function (err, user) {
                        if (err) console.log(err.message);
                        if (!user) {
                            console.log('adding client to trainer failed. user not found.');
                        } else if (user) {
                            user.trainers.push(trainer._id);

                            /* gamification */
                            var reward = {
                                concept: "new trainer",
                                date: Date(),
                                value: +5
                            };
                            user.points.history.push(reward);
                            user.points.total = user.points.total + 5;
                            /* end of gamification */

                            var notification = {
                                state: "pendent",
                                message: "trainer has accepted to train you",
                                link: "training",
                                icon: "newtrainer.png",
                                date: Date()
                            };
                            user.notifications.push(notification);
                            user.save(function (err) {
                                if (err) console.log(err.message);
                                console.log("trainer added to user");
                            });
                        }
                    });
                }
            }

        }//end else if
    });
};

/** PUT '/trainers/:trainerid' **/
exports.updateTrainer = function (req, res) {
    var trainer = req.body;
    userModel.update({'tokens.token': req.headers['x-access-token']}, trainer,
        function (err) {
            if (err) return console.log(err);
            console.log(trainer);
            res.status(200).jsonp(trainer);
        });
};

/** POST '/trainers/valorateTrainer/:trainerid' **/
exports.valorateTrainer = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'sending valoration failed. user not found.'});
        } else if (user) {
            //ara busquem el trainer
            userModel.findOne({_id: req.params.trainerid, role: 'trainer'}, function (err, trainer) {
                if (err) return res.send(500, err.message);
                if (!trainer) {
                    res.json({success: false, message: 'sending valoration failed. trainer not found.'});
                } else if (trainer) {
                    //comprovem que el client no hagi valorat ja el trainer
                    var javalorat = false;
                    var indexValoration=-1;
                    for (var i = 0; i < trainer.valorations.length; i++) {

                        if (trainer.valorations[i].clientid.equals(user._id)) {
                            javalorat = true;
                            indexValoration=JSON.parse(JSON.stringify(i));
                        }
                    }

                    if (javalorat == false) {
                        var valoration = {
                            clientid: user._id,
                            date: Date(),
                            message: req.body.message,
                            value: req.body.value
                        };
                        if(!trainer.valoration)
                        {
                            trainer.valoration=0;
                        }
                        var actual = (+trainer.valoration) * trainer.valorations.length;
                        var valor = ((+actual) + (+valoration.value)) / (trainer.valorations.length + 1);
                        trainer.valoration = valor;
                        trainer.valorations.push(valoration);

                        var notification = {
                            state: "pendent",
                            message: "client has valorated you",
                            link: "dashboard",
                            icon: "newvaloration.png",
                            date: Date()
                        };
                        trainer.notifications.push(notification);

                        trainer.save(function (err) {
                            if (err) return res.send(500, err.message);

                            //aquí la gamificació de l'user que fa la valoració per primer cop
                            /* gamification */
                            var reward = {
                                concept: "valorating trainer",
                                date: Date(),
                                value: +1
                            };
                            user.points.history.push(reward);
                            user.points.total = user.points.total + 1;
                            /* end of gamification */
                            user.save(function (err) {
                                /*if (err) return res.send(500, err.message);

                                 res.status(200).jsonp(routine);*/
                                console.log("points of gamification on trainer valorating added to user");
                            });

                            userModel.findOne({_id: trainer._id})
                                .lean()
                                .populate('diets', 'title description')
                                .populate('routines', 'title description')
                                .populate('trainers', 'name avatar description')
                                .populate('clients.client', 'name avatar')
                                .populate('publications')
                                .exec(function (err, trainer) {
                                    if (err) return res.send(500, err.message);
                                    res.status(200).jsonp(trainer);
                            });
                        });
                    } else {//end if javalorat==false
                        console.log("user already has valorated trainer, updating valoration and recalculating total");
                        var valoration = {
                            clientid: user._id,
                            date: Date(),
                            message: req.body.message,
                            value: req.body.value
                        };
                        var actual = ((+trainer.valoration) * (+trainer.valorations.length)) - (+trainer.valorations[indexValoration].value);//suma total valoracions sense la que estic canviant
                        var valor = ((+actual) + (+valoration.value)) / (trainer.valorations.length);
                        console.log(actual + ", " + valor);
                        trainer.valoration = valor;
                        trainer.valorations[indexValoration]=valoration;

                        var notification = {
                            state: "pendent",
                            message: "client has updated the valoration on you",
                            link: "dashboard",
                            icon: "newvaloration.png",
                            date: Date()
                        };
                        trainer.notifications.push(notification);

                        trainer.save(function (err) {
                            if (err) return res.send(500, err.message);

                            userModel.findOne({_id: trainer._id})
                                .lean()
                                .populate('diets', 'title description')
                                .populate('routines', 'title description')
                                .populate('trainers', 'name avatar description')
                                .populate('clients.client', 'name avatar')
                                .populate('publications')
                                .exec(function (err, trainer) {
                                    if (err) return res.send(500, err.message);
                                    res.status(200).jsonp(trainer);
                            });
                        });
                    }
                }//end else if
            });
        }//end else if
    });
};

/** GET '/trainers/:trainerid/getNotifications' **/
exports.getNotifications = function (req, res) {
    userModel.findOne({_id: req.params.trainerid, role: 'trainer'})
        .exec(function (err, trainer) {
            if (err) return res.send(500, err.message);
            for (var i = 0; i < trainer.notifications.length; i++) {
                if (trainer.notifications[i].state == "pendent") {
                    trainer.notifications[i].state = "viewed";
                    trainer.notifications[i].dateviewed = Date();
                }
            }
            trainer.save(function (err) {
                if (err) return res.send(500, err.message);

                res.status(200).jsonp(trainer.notifications);
            });
        });
};

/** GET '/trainers/searchByName/:trainername' **/
exports.searchByName = function (req, res) {
    console.log("searchByName");
    userModel.find({name: new RegExp(req.params.trainername, "i"), role: 'trainer'})
        .limit(Number(req.query.pageSize))
        .skip(Number(req.query.pageSize)*Number(req.query.page))
        .exec(function (err, trainers) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(trainers);
        });
};

/** DELETE '/trainers/:trainerid' **/
exports.removeTrainer = function (req, res) {/* AQUESTA FUNCIÖ CREC QUE ESTÂ MAL PLANTEJADA, DIRIA QUE NO FUNCIONA, si jo també ho diria no es pot trobar despres d'eliminar */
    userModel.findByIdAndRemove({_id: req.params.trainerid}, function (err) {/**La he corregit, pero tenint en compte que tenim només un model ara potser es redundant no?**/
        if (err) return res.send(500, err.message);
        res.status(200).send("Trainer Deleted");
    });
};
