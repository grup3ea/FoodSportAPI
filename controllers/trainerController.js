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

exports.updateTrainer = function (req, res) {
    trainerModel.update({id: req.params.id},
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

exports.removeTrainer = function (req, res) {
    trainerModel.remove({id: req.params.id}, function (err, trainers) {
        if (err)
            res.send(err);
        trainerModel.find(function (err, trainers) {
            if (err)
                res.send(err)
            res.json(trainers);
        });
    });
}
