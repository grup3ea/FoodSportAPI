var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable


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
