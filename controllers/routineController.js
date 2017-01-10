var express = require('express');
var app = express();
var config = require('../config/config');
var crypto = require('crypto');

app.set('superSecret', config.secret);
var userModel = require('../models/userModel');
var routineModel = require('../models/routineModel');
var trainerModel = require('../models/trainerModel');

/** GET '/routines/' **/
exports.getRoutines = function (req, res) {
    routineModel.find(function (err, routines) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(routines);
    });
};

/** GET '/routines/:routineid' **/
exports.getRoutineById = function (req, res) {
    routineModel.findOne({_id: req.params.routineid})
        .lean()
        .populate('trainer', 'name avatar')
        .populate('client', 'name avatar points.total')
        .exec(function (err, routine) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(routine);
        });
};

/** POST '/routines/addToClient/:clientid' **/
exports.addRoutineToClient = function (req, res) {
    userModel.findOne({
        'tokens.token': req.headers['x-access-token'],
        'clients.client': req.params.clientid,
        'role': 'trainer'
    }, function (err, trainer) {
        if (err) return res.send(500, err.message);
        if (!trainer) {
            res.json({success: false, message: 'Routine creation failed. Trainer not found.'});
        } else if (trainer) {
            var routine = new routineModel({
                title: req.body.title,
                description: req.body.description,
                trainer: trainer._id,//a partir del token, pillem la id
                client: req.params.clientid//es guarda de quin user és la routine
            });
            //guardem la routine
            routine.save(function (err, routine) {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send(err.message);
                }
                //ara guardem la routineid al trainer
                trainer.routines.push(routine._id);
                trainer.save(function (err, trainer) {
                    if (err) return res.send(500, err.message);

                });
                //res.status(200).jsonp(routine);
                //ara afegim la routine al client
                userModel.findOne({'_id': req.params.clientid}, function (err, user) {
                    if (err) return res.send(500, err.message);
                    if (!user) {
                        res.json({success: false, message: 'adding routine to client failed. user not found.'});
                    } else if (user) {
                        user.routines.push(routine._id);
                        /* gamification */
                        var reward = {
                            concept: "new routine",
                            date: Date(),
                            value: +5
                        };
                        user.points.history.push(reward);
                        user.points.total = user.points.total + 5;
                        /* end of gamification */

                        var notification = {
                            state: "pendent",
                            message: "trainer has added a routine to you",
                            link: "training",
                            icon: "newroutine.png",
                            date: Date()
                        };
                        user.notifications.push(notification);
                        user.save(function (err) {
                            if (err) return res.send(500, err.message);

                            res.status(200).jsonp(routine);
                        });
                    }//end else if
                });
            });
        }//else
    });
};

/** POST '/routines/:routineid/days' **/
exports.addDayToRoutine = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, trainer) {
        if (err) return res.send(500, err.message);
        if (!trainer) {
            res.json({success: false, message: 'Routine day addition failed. Trainer not found.'});
        } else if (trainer) {
            routineModel.findOne({_id: req.params.routineid}, function (err, routine) {
                if (err) return res.send(500, err.message);

                if (trainer._id.equals(routine.trainer)) {// si el trainer que fa el post realment és el trainer creator de la routine
                    routine.days.push(req.body.day);
                    routine.save(function (err, routine) {
                        if (err) {
                            return res.status(500).send(err.message);
                        }
                        res.status(200).jsonp(routine);
                    });
                }
            });
        }// end else if
    });
};

/** POST '/routines/choose' **/
exports.chooseRoutine = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'choosing routine failed. user not found.'});
        } else if (user) {
            console.log(user);//aquí potser caldria comprovar que la routine és la que han creat per l'user
            user.routines.push(req.body.routineid);
            /* gamification */
            var reward = {
                concept: "choosing routine",
                date: Date(),
                value: +5
            };
            user.points.history.push(reward);
            user.points.total = user.points.total + 5;
            /* end of gamification */
            user.save(function (err) {
                if (err) return res.send(500, err.message);

                res.status(200).jsonp(user);
            });
        }//end else if
    });
};

/** DELETE '/routines/choose' **/
exports.unchooseRoutine = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'choosing routine failed. user not found.'});
        } else if (user) {
            for (var i = 0; i < user.routines.length; i++) {
                if (user.routines[i] == req.body.routineid) {//deletes the diets of the user with the dietid
                    user.routines.splice(i, 1);
                }
            }
            /* gamification */
            var reward = {
                concept: "unchoosing routine",
                date: Date(),
                value: -7
            };
            user.points.history.push(reward);
            user.points.total = user.points.total - 7;
            /* end of gamification */
            user.save(function (err) {
                if (err) return res.send(500, err.message);

                res.status(200).jsonp(user);
            });
        }//end else if
    });
};

/** POST '/routines/completeDay/:routineid' **/
exports.completeDayGamificatedRoutine = function (req, res) {
    //1r intentamos darle los puntos al usuario por haber completado el día
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err)
            return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'choosing routine failed. user not found.'});
        }
        else if (user) {
            /* gamification */
            var reward =
                {
                    concept: "routine day complete",
                    date: Date(),
                    value: +1
                };
            user.points.history.push(reward);
            user.points.total = user.points.total + 1;
            /* end of gamification */
            user.save(function (err) {
                if (err)
                    return res.send(500, err.message);
            });
            //Ahora intentamos añadir done = true dentro del modelo rutina
            routineModel.findOne({'_id': req.params.routineid}, function (err, routine) {
                if (err)
                    return res.send(500, err.message);
                if (!routine) {
                    res.json({success: false, message: 'Routine not found'});
                }
                else if (routine) {
                    var indexDay = -1;
                    for (var i = 0; i < routine.days.length; i++) //routine.days
                    {
                        if (routine.days[i]._id.equals(req.body.dayid)) {
                            //aquí hem trobat el dia que busquem
                            indexDay = JSON.parse(JSON.stringify(i));
                        }
                    }//End for looking for days
                    if (indexDay > -1) {
                        /* True to day done*/
                        routine.days[indexDay].done = true;
                        /* end of done*/
                        routine.save(function (err) {
                            if (err)
                                return res.send(500, err.message);
                            res.status(200).jsonp(routine.days);
                        });//Routine.save
                    }//End if when day foung
                    else {
                        res.json({success: false, message: 'Day not found'});
                    }
                }//End else if found routine
            });//En routineModel for done = true
        }//End else if (user)
    });//En UserModel findOne()
};//End function
