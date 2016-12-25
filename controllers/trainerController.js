var express = require('express');
var app = express();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable


var trainerModel = require('../models/trainerModel');
var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');
var routineModel = require('../models/routineModel');

exports.getTrainers = function (req, res) {
    trainerModel.find(function (err, trainers) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(trainers);
    });
};
exports.getTrainerById = function (req, res) {
    trainerModel.findOne({_id: req.params.trainerid})
        .populate('routines')
        .populate('clients.client')
        .populate('clientsPetitions.clientid')
        .exec(function (err, trainer) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(trainer);
        });
};

/*** OK  ***/

exports.register = function (req, res) {
    var trainer = new trainerModel({
        name: req.body.name,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        role: req.body.role,
        discipline: req.body.discipline
    });
    trainer.save(function (err, trainer) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(trainer);
    });
};
exports.login = function (req, res) {
    trainerModel.findOne({
        email: req.body.email
    }, function (err, trainer) {
        if (err) throw err;
        if (!trainer) {
            res.json({success: false, message: 'Authentication failed. trainer not found.'});
        } else if (trainer) {
            req.body.password = crypto.createHash('sha256').update(req.body.password).digest('base64');
            if (trainer.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
              trainer.token="";
                var token = jwt.sign(trainer, app.get('superSecret'), {
                    //  expiresIn: 86400 // expires in 24 hours
                });
                trainer.token = token;

                trainer.save(function (err, trainer) {
                    if (err) res.send(500, err.message);

                    // return the information including token as JSON
                    trainer.password = "";
                    res.json({
                        user: trainer,
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                });
            }
        }
    });
};


exports.acceptClientPetition = function (req, res) {
    trainerModel.findOne({'token': req.headers['x-access-token']}, function (err, trainer) {
        if (err) res.send(500, err.message);
        if(!trainer) {
            res.json({success: false, message: 'adding client to trainer failed. trainer not found.'});
        }else if(trainer){
          console.log(trainer);//aquí potser caldria comprovar que la routine és la que han creat per l'trainer
          //busquem la petition que estem processant
          for(var i=0; i<trainer.clientsPetitions.length; i++)
          {
            if(trainer.clientsPetitions[i]._id.equals(req.body.petitionid))
            {
              var newClient={
                client: trainer.clientsPetitions[i].clientid,
                petitionMessage: trainer.clientsPetitions[i].message,
                date: new Date()
              };
              trainer.clients.push(newClient);

              //la petició la marco com a accepted
              trainer.clientsPetitions[i].state="accepted";
              trainer.save(function (err) {
                  if (err) res.send(500, err.message);

                  trainerModel.findOne({_id: trainer._id})
                      .populate('routines')
                      .populate('clients.client')
                      .populate('clientsPetitions.clientid')
                      .exec(function (err, trainer) {
                          if (err) res.send(500, err.message);
                          res.status(200).jsonp(trainer);
                      });
              });
              //ara afegim el trainer al user.trainer
              userModel.findOne({'_id': trainer.clientsPetitions[i]._id}, function (err, user) {
                    if (err) console.log(err.message);
                  if(!user) {
                      console.log('adding client to trainer failed. trainer not found.');
                  }else if(user){
                    user.trainers.push(trainer._id);
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
/*** OK 3 paràmetres***/

exports.updateTrainer = function (req, res) {
    trainerModel.update({_id: req.params.trainerid},
        {
            $set: {
                name: req.body.name,
                email: req.body.email,
                discipline: req.body.discipline
            }
        },
        function (err) {
            if (err)
                res.send(err);
            // Obtiene y devuelve todos los students tras crear uno de ellos
            trainerModel.find(function (err, trainer) {
                if (err)
                    res.send(err);
                res.json(trainer);
            });
        });
};

/*** OK ***/

exports.removeTrainer = function (req, res) {
    trainerModel.remove({_id: req.params.trainerid}, function (err) {
        if (err)
            res.send(err);
        trainerModel.find(function (err, trainer) {
            if (err)
                res.send(err);
            res.json(trainer);
        });
    });
};

/*** TEST ***/
/* tot això que hi ha a partir de aquí què és, no funciona? */
exports.TrainerNewClient = function (req, res) {

    var query = {_id: req.params.id};
    var update = {$addToSet: {"clients": req.body.client_id}};
    var options = {};
    trainerModel.findOneAndUpdate(query, update, options, function (err, trainer) {
        if (err) {
            res.send(err);
        }
        if (trainer) {
            trainerModel.findById(trainer._id).populate('clients').exec().then(function (err, trainer) {
                if (err)
                    res.send(err);
                res.send(trainer);
            });
        }
    });
};

exports.TrainerRemoveClient = function (req, res) {
    var query = {_id: req.params.id};
    var update = {$pull: {"clients": req.params.client_id}};
    var options = {};
    trainerModel.findOneAndUpdate(query, update, options, function (err, trainer) {
        if (err) {
            res.send(err);
        }
        if (trainer) {
            trainerModel.findById(trainer._id).populate('clients').exec().then(function (err, trainer) {
                if (err)
                    res.send(err);
                res.send(trainer);
            });
        }
    });
};

/*** TEST ***/

exports.TrainerNewRoutine = function (req, res) {

    var query = {_id: req.params.id};
    var update = {$addToSet: {"routines": req.body.routine_id}};
    var options = {};
    trainerModel.findOneAndUpdate(query, update, options, function (err, trainer) {
        if (err) {
            res.send(err);
        }
        if (trainer) {
            trainerModel.findById(trainer._id).populate('routines').exec().then(function (err, trainer) {
                if (err)
                    res.send(err);
                res.send(trainer);
            });
        }
    });
};

exports.TrainerRemoveRoutine = function (req, res) {
    var query = {_id: req.params.id};
    var update = {$pull: {"routines": req.params.routine_id}};
    var options = {};
    trainerModel.findOneAndUpdate(query, update, options, function (err, trainer) {
        if (err) {
            res.send(err);
        }
        if (trainer) {
            trainerModel.findById(trainer._id).populate('routines').exec().then(function (err, trainer) {
                if (err)
                    res.send(err);
                res.send(trainer);
            });
        }
    });
};
