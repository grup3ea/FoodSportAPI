var express = require('express');
var app = express();
var config = require('../config/config');
var crypto = require('crypto');

app.set('superSecret', config.secret);
var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');
//var chefModel = require('../models/chefModel');

/** GET '/diets' ***/
exports.getDiets = function (req, res) {
    dietModel.find()
    .limit(Number(req.query.pageSize))
    .skip(Number(req.query.pageSize)*Number(req.query.page))
    .exec(function (err, diets) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(diets);
    });
};

/** GET '/diets/:dietid' **/
exports.getDietById = function (req, res) {
    dietModel.findOne({_id: req.params.dietid})
    .lean()
    .populate('chef', 'name avatar')
    .exec(function (err, diet) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(diet);
    });
};

/**DELETE '/diets/:dietid' **/
exports.deleteDietById = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token'], role:'chef'}, function (err, chef) {
        if (err) return res.send(500, err.message);
        if (!chef) {
            res.json({success: false, message: 'Chef not found.'});
        } else if (chef) {
            for (var i = 0; i < chef.diets.length; i++) {
                if (chef.diets[i].equals(req.params.dietid)) {
                    chef.diets.splice(i, 1);
                    chef.save(function (err, chef) {//guardem el chef amb la dieta treta
                        if (err) return res.send(500, err.message);

                        dietModel.findByIdAndRemove({_id: req.params.dietid}, function (err) {
                            if (err !== null) return res.send(500, err.message);
                            res.status(200).jsonp('Deleted diet');
                        });
                    });
                }
            }
        }
    });
};

/** PUT '/diets/:dietid' **/
exports.updateDietById = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token'], role:'chef'}, function (err, chef) {
        if (err) return res.send(500, err.message);
        if (!chef) {
            res.json({success: false, message: 'Chef not found.'});
        } else if (chef) {
            for (var i = 0; i < chef.diets.length; i++) {
                if (chef.diets[i].equals(req.params.dietid)) {
                    chef.diets.splice(i, 1); //<-- splice? quan s'està fent un update? no s'hauria d'eliminar
                    //tot i que no afecta, pq l'splice aquest després no es guarda a la base de dades pq no hi ha cap chef.save
                    /* Solo si esa dieta ha sido creada por el chef */
                    var id = req.params.dietid;
                    var diet = req.body;
                    dietModel.update({"_id": id}, diet,
                        function (err) {
                            if (err) return console.log(err);
                            console.log(diet);
                            res.status(200).jsonp(diet);
                        });
                }
            }
        }
    });
};

/**POST '/diets' **/
exports.createDiet = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token'], role:'chef'}, function (err, chef) {
        if (err) return res.send(500, err.message);
        if (!chef) {
            res.json({success: false, message: 'Diet creation failed. Chef not found.'});
        } else if (chef) {
            var diet = new dietModel({
                title: req.body.title,
                description: req.body.description,
                chef: chef._id,//a partir del token, pillem la id
                client: req.params.clientid//es guarda de quin user és la diet
            });
            //guardem la diet
            diet.save(function (err, diet) {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send(err.message);
                }
                //ara guardem la dietid al chef
                chef.diets.push(diet._id);
                chef.save(function (err, chef) {
                    if (err) return res.send(500, err.message);

                });
                res.status(200).jsonp(diet);
            });
        }//else
    });
};

/** POST '/diets/:dietid/days' **/
exports.addDayToDiet = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token'], role:'chef'}, function (err, chef) {
        if (err) return res.send(500, err.message);
        if (!chef) {
            res.json({success: false, message: 'Diet day addition failed. Trainer not found.'});
        } else if (chef) {
            dietModel.findOne({_id: req.params.dietid}, function (err, diet) {
                if (err) return res.send(500, err.message);

                if (chef._id.equals(diet.chef)) {// si el chef que fa el post realment és el chef creator de la diet
                    diet.days.push(req.body.day);
                    diet.save(function (err, diet) {
                        if (err) {
                            return res.status(500).send(err.message);
                        }
                        res.status(200).jsonp(diet);
                    });
                }
            });
        }// end else if
    });
};

/** POST '/diets/choose' **/
exports.chooseDiet = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'choosing diet failed. user not found.'});
        } else if (user) {
            user.diets.push(req.body.dietid);
            /* gamification */
            var reward = {
                concept: "choosing diet",
                date: Date(),
                value: +5
            };
            user.points.history.push(reward);
            user.points.total = user.points.total + 5;
            /* end of gamification */
            user.save(function (err) {
                if (err) return res.send(500, err.message);

                res.status(200).jsonp(user);
            })
        }//end else if
    });
};

/** DELETE '/diets/choose' **/
exports.unchooseDiet = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'user not found.'});
        } else if (user) {
            for (var i = 0; i < user.diets.length; i++) {
                if (user.diets[i] == req.body.dietid) {//deletes the diets of the user with the dietid
                    user.diets.splice(i, 1);
                }
            }
            /* gamification */
            var reward = {
                concept: "unchoosing diet",
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

/** POST '/diets/completeDay/:dietid' **/
exports.completeDayGamificatedDiet = function (req, res) {
    //1r intentamos darle los puntos al usuario por haber completado el día
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err)
            return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'choosing diet failed. user not found.'});
        }
        else if (user) {
            /* gamification */
            var reward =
                {
                    concept: "diet day complete",
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
            //Ahora intentamos añadir done = true dentro del modelo dieta
            dietModel.findOne({'_id': req.params.dietid}, function (err, diet) {
                if (err)
                    return res.send(500, err.message);
                if (!diet) {
                    res.json({success: false, message: 'Diet not found'});
                }
                else if (diet) {
                    var indexDay = -1;
                    for (var i = 0; i < diet.days.length; i++) //diet.days
                    {
                        if (diet.days[i]._id.equals(req.body.dayid)) {
                            //aquí hem trobat el dia que busquem
                            indexDay = JSON.parse(JSON.stringify(i));
                        }
                    }//End for looking for days
                    if (indexDay > -1) {
                        /* True to day done*/
                        diet.days[indexDay].done = true;
                        /* end of done*/
                        diet.save(function (err) {
                            if (err)
                                return res.send(500, err.message);
                            res.status(200).jsonp(diet);
                        });//diet.save
                    }//End if when day foung
                    else {
                        res.json({success: false, message: 'Day not found'});
                    }
                }//End else if found diet
            });//En dietModel for done = true
        }//End else if (user)
    });//En UserModel findOne()
};//End function
