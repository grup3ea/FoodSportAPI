var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable

var userModel = require('../models/userModel');
var routineModel = require('../models/routineModel');

exports.getRoutines = function (req, res) {
    routineModel.find(function (err, routines) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(routines);
    });
};


//  get /routines/:id
exports.getRoutineById = function (req, res) {
    routineModel.findOne({_id: req.params.routineid}, function (err, routine) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(routine);
    });
};


exports.addRoutine = function (req, res) {
    var routine = new routineModel({
        title: req.body.title,
        description: req.body.description

    });
    routine.save(function (err, routine) {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err.message);
        }
        res.status(200).jsonp(routine);
    });
};

// add day
exports.addDayToRoutine = function (req, res) {
    routineModel.findOne({_id: req.params.routineid}, function (err, routine) {
        if (err) res.send(500, err.message);
        routine.days.push(req.body.day);
        routine.save(function (err, routine) {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.status(200).jsonp(routine);
        });
    });
};


exports.chooseRoutine = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        console.log(user);
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
        })
    });
};
exports.unchooseRoutine = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
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
        })
    });
};

exports.completeDay = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
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
        })
    });
};
