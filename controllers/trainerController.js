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
        .lean()
        .populate('routines', 'title description')
        .populate('clients.client', 'name avatar points')
        .populate('clientsPetitions.clientid', 'name avatar')
        .exec(function (err, trainer) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(trainer);
        });
};
exports.searchByDiscipline = function (req, res) {
    trainerModel.find({disciplines: req.body.discipline})
        .exec(function (err, trainers) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(trainers);
        });
};

/*** OK  ***/

exports.register = function (req, res) {
    var trainer = new trainerModel({
        name: req.body.name,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        avatar: 'img/user.png',
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
              var indexToken=-1;
              for(var i=0; i<trainer.tokens.length; i++)
              {
                if(trainer.tokens[i].userAgent==req.body.userAgent)
                {
                  indexToken=JSON.parse(JSON.stringify(i));
                }
              }
              console.log(indexToken);
              if(indexToken==-1)
              {//userAgent no exist

                var tokenGenerated = jwt.sign({foo:'bar'}, app.get('superSecret'), {
                    //  expiresIn: 86400 // expires in 24 hours
                });
                var newToken={
                  userAgent:req.body.userAgent,
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
              }else{//userAgent already exist
                trainer.tokens[indexToken].token="";

                var tokenGenerated = jwt.sign({foo:'bar'}, app.get('superSecret'), {
                    //  expiresIn: 86400 // expires in 24 hours
                });
                trainer.tokens[indexToken].token=tokenGenerated;
                trainer.tokens[indexToken].ip=req.body.ip;
                trainer.tokens[indexToken].lastLogin=Date();
              }
              trainer.save(function (err, trainer) {
                  if (err) res.send(500, err.message);

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


exports.acceptClientPetition = function (req, res) {
    trainerModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, trainer) {
        if (err) res.send(500, err.message);
        if(!trainer) {
            res.json({success: false, message: 'adding client to trainer failed. trainer not found.'});
        }else if(trainer){
          console.log(trainer);//aquí potser caldria comprovar que la routine és la que han creat per l'trainer
          //busquem la petition que estem processant
          for(var i=0; i<trainer.clientsPetitions.length; i++) //routine.days
          {
            if(trainer.clientsPetitions[i]._id.equals(req.body.petitionid))
            {
              var newClient={
                client: trainer.clientsPetitions[i].clientid,
                petitionMessage: trainer.clientsPetitions[i].message,
                date: Date()
              };
              trainer.clients.push(newClient);

              //la petició la marco com a accepted
              trainer.clientsPetitions[i].state="accepted";
              trainer.save(function (err) {
                  if (err) res.send(500, err.message);

                  trainerModel.findOne({_id: trainer._id})
                      .lean()
                      .populate('routines', 'title description')
                      .populate('clients.client', 'name avatar points')
                      .populate('clientsPetitions.clientid', 'name avatar')
                      .exec(function (err, trainer) {
                          if (err) res.send(500, err.message);
                          res.status(200).jsonp(trainer);
                      });
              });
              //ara afegim el trainer al user.trainer
              userModel.findOne({'_id': trainer.clientsPetitions[i].clientid}, function (err, user) {
                    if (err) console.log(err.message);
                  if(!user) {
                      console.log('adding client to trainer failed. user not found.');
                  }else if(user){
                    user.trainers.push(trainer._id);

                    /* gamification */
                    var reward={
                      concept: "new trainer",
                      date: Date(),
                      value: +5
                    };
                    user.points.history.push(reward);
                    user.points.total=user.points.total+5;
                    /* end of gamification */

                    var notification={
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

exports.updateTrainer = function (req, res) {
  var trainer= req.body;
  trainerModel.update({"_id": req.params.trainerid}, trainer,
      function (err) {
          if (err) return console.log(err);
          console.log( trainer);
          res.status(200).jsonp(trainer);
      });
};
exports.valorateTrainer = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'sending valoration failed. user not found.'});
        }else if(user){
          //ara busquem el trainer
          trainerModel.findOne({_id: req.params.trainerid}, function (err, trainer) {
              if (err) res.send(500, err.message);
              if(!trainer) {
                  res.json({success: false, message: 'sending valoration failed. trainer not found.'});
              }else if(trainer){
                //comprovem que el client no hagi valorat ja el trainer
                var javalorat=false;
                for(var i=0; i<trainer.valorations.length; i++)
                {
                  if(trainer.valorations[i].clientid.equals(user._id))
                  {
                    javalorat=true;
                  }
                }
                if(javalorat==false)
                {
                  var valoration={
                    clientid: user._id,
                    date: Date(),
                    message: req.body.message,
                    value: req.body.value
                  };
                  trainer.valorations.push(valoration);
                  var notification={
                    state: "pendent",
                    message: "client has valorated you",
                    link: "dashboard",
                    icon: "newvaloration.png",
                    date: Date()
                  };
                  trainer.notifications.push(notification);

                  trainer.save(function (err) {
                      if (err) res.send(500, err.message);

                      res.status(200).jsonp(trainer);
                  });
                }else{//end if javalorat==false
                    res.json({success: false, message: 'sending valoration failed. user has already valorated this trainer.'});
                }
              }//end else if
          });
          /* gamification */
          var reward={
            concept: "valorating trainer",
            date: Date(),
            value: +1
          };
          user.points.history.push(reward);
          user.points.total=user.points.total+1;
          /* end of gamification */
          user.save(function (err) {
              /*if (err) res.send(500, err.message);

              res.status(200).jsonp(routine);*/
              console.log("points of gamification on trainer valorating added to user");
          });
        }//end else if
    });
};


exports.getNotifications = function (req, res) {
    trainerModel.findOne({_id: req.params.trainerid})
        .exec(function (err, trainer) {
            if (err) res.send(500, err.message);
            for(var i=0; i<trainer.notifications.length; i++)
            {
              if(trainer.notifications[i].state=="pendent")
              {
                trainer.notifications[i].state="viewed";
                trainer.notifications[i].dateviewed=Date();
              }
            }
            trainer.save(function (err) {
                if (err) res.send(500, err.message);

                res.status(200).jsonp(trainer.notifications);
            });
        });
};


exports.searchByName = function (req, res) {
  console.log("searchByName");
    trainerModel.find({'name': req.params.trainername}, function (err, trainers) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(trainers);
    });
};
exports.searchByDiscipline = function (req, res) {
    trainerModel.find({'disciplines': req.params.discipline}, function (err, trainers) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(trainers);
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
