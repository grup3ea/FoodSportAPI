var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable


var trainerModel = require('../models/trainerModel');

exports.getTrainers = function (req, res) {
    trainerModel.find(function (err, trainers) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(trainers);
    });
};

/*** OK  ***/

exports.addTrainer = function (req, res) {
    var trainer = new trainerModel({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        discipline: req.body.discipline
    });
    trainer.save(function (err, trainer) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(trainer);
    });
};

/*** OK ***/

exports.updateTrainer = function (req, res) {
    trainerModel.update({_id: req.params.id},
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
                    res.send(err)
                res.json(trainer);
            });
        });
}

/*** OK ***/

exports.removeTrainer = function (req, res) {
    trainerModel.remove({_id: req.params.id}, function (err) {
        if (err)
            res.send(err);
        trainerModel.find(function (err, trainer) {
            if (err)
                res.send(err)
            res.json(trainer);
        });
    });
}

/*** TEST ***/

exports.TrainerNewClient = function (req, res) {

    var query = {_id: req.params.id};
    var update = {$addToSet : {"clients" : req.body.client_id}};
    var options = {};
    trainerModel.findOneAndUpdate(query, update, options, function(err, trainer) {
        if (err) {
            res.send(err);
        }
        if(trainer){
            trainerModel.findById(trainer._id).populate('clients').exec().then(function(err, trainer) {
                if (err)
                    res.send(err)
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
                    res.send(err)
                res.send(trainer);
            });
        }
    });
}

/*** TEST ***/

exports.TrainerNewRoutine = function (req, res) {

    var query = {_id: req.params.id};
    var update = {$addToSet : {"routines" : req.body.routine_id}};
    var options = {};
    trainerModel.findOneAndUpdate(query, update, options, function(err, trainer) {
        if (err) {
            res.send(err);
        }
        if(trainer){
            trainerModel.findById(trainer._id).populate('routines').exec().then(function(err, trainer) {
                if (err)
                    res.send(err)
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
                    res.send(err)
                res.send(trainer);
            });
        }
    });
}