var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');


app.set('superSecret', config.secret); // secret variable

var userModel = require('../models/userModel');
var routineModel = require('../models/routineModel');
var trainerModel = require('../models/trainerModel');

exports.getRoutines = function (req, res) {
    routineModel.find(function (err, routines) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(routines);
    });
};


//  get /routines/:id
exports.getRoutineById = function (req, res) {
    routineModel.findOne({_id: req.params.routineid})
    .populate('trainer')
    .exec(function (err, routine) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(routine);
    });
};


exports.addRoutineToClient = function (req, res) {
  trainerModel.findOne({'token': req.headers['x-access-token'], 'clients.client': req.params.clientid}, function (err, trainer) {
    if (err) res.send(500, err.message);
    if (!trainer) {
        res.json({success: false, message: 'Routine creation failed. Trainer not found.'});
    }else if(trainer){
      var routine = new routineModel({
          title: req.body.title,
          description: req.body.description,
          trainer: trainer._id//a partir del token, pillem la id
      });
      //guardem la routine
      routine.save(function (err, routine) {
          if (err) {
              console.log(err.message);
              return res.status(500).send(err.message);
          }
          //ara guardem la routineid al trainer
          trainer.routines.push(routine._id);
          trainer.save(function(err, trainer){
            if (err) res.send(500, err.message);

          });
          //res.status(200).jsonp(routine);
          //ara afegim la routine al client
          userModel.findOne({'_id': req.params.clientid}, function (err, user) {
              if (err) res.send(500, err.message);
              if(!user) {
                  res.json({success: false, message: 'adding routine to client failed. user not found.'});
              }else if(user){
                user.routines.push(routine._id);
                /* gamification */
                var reward={
                  concept: "new routine",
                  date: Date(),
                  value: +5
                };
                user.points.history.push(reward);
                user.points.total=user.points.total+5;
                /* end of gamification */
                user.save(function (err) {
                    if (err) res.send(500, err.message);

                    res.status(200).jsonp(routine);
                });
              }//end else if
          });
      });
    }//else
  });
};

// add day
exports.addDayToRoutine = function (req, res) {
  trainerModel.findOne({'token': req.headers['x-access-token']}, function (err, trainer) {
    if (err) res.send(500, err.message);
    if(!trainer) {
        res.json({success: false, message: 'Routine day addition failed. Trainer not found.'});
    }else if(trainer){
      routineModel.findOne({_id: req.params.routineid}, function (err, routine) {
          if (err) res.send(500, err.message);

          if(trainer._id.equals(routine.trainer))
          {// si el trainer que fa el post realment és el trainer creator de la routine
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


exports.chooseRoutine = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'choosing routine failed. user not found.'});
        }else if(user){
          console.log(user);//aquí potser caldria comprovar que la routine és la que han creat per l'user
          user.routines.push(req.body.routineid);
          /* gamification */
          var reward={
            concept: "choosing routine",
            date: Date(),
            value: +5
          };
          user.points.history.push(reward);
          user.points.total=user.points.total+5;
          /* end of gamification */
          user.save(function (err) {
              if (err) res.send(500, err.message);

              res.status(200).jsonp(user);
          });
        }//end else if
    });
};
exports.unchooseRoutine = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'choosing routine failed. user not found.'});
        }else if(user){
          for(var i=0; i<user.routines.length; i++)
          {
            if(user.routines[i]==req.body.routineid)
            {//deletes the diets of the user with the dietid
              user.routines.splice(i, 1);
            }
          }
          /* gamification */
          var reward={
            concept: "unchoosing routine",
            date: Date(),
            value: -7
          };
          user.points.history.push(reward);
          user.points.total=user.points.total-7;
          /* end of gamification */
          user.save(function (err) {
              if (err) res.send(500, err.message);

              res.status(200).jsonp(user);
          });
        }//end else if
    });
};

exports.completeDay = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'choosing routine failed. user not found.'});
        }else if(user){
          /* gamification */
          var reward={
            concept: "routine day complete",
            date: Date(),
            value: +1
          };
          user.points.history.push(reward);
          user.points.total=user.points.total+1;
          /* end of gamification */
          user.save(function (err) {
              if (err) res.send(500, err.message);

              res.status(200).jsonp(user);
          });
        }//end else if
    });
};
