var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable


var dietModel = require('../models/dietModel');

exports.getDiets = function (req, res) {
    dietModel.find(function (err, diets) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(diets);
    });
};
/**POST add new diet to DB - Register**/
exports.addDiet = function (req, res) {
    console.log(req.body);
    var diet = new dietModel({
        title: req.body.title,
        description: req.body.description,
    });
    diet.save(function (err, diet) {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err.message);
        }
        res.status(200).jsonp(diet);
    });
};

// add day
exports.addDayToDiet = function (req, res) {
    dietModel.findOne({_id: req.params.dietid}, function (err, diet) {
        if (err) res.send(500, err.message);
        diet.days.push(req.body.day);
        console.log(req.body);
        diet.save(function (err, diet) {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.status(200).jsonp(diet);
        });
    });
};


/** DELETE diet by diet._id**/
//  /diets/:id
exports.deleteDietById = function (req, res) {
    dietModel.findByIdAndRemove({_id: req.params.dietid}, function (err) {
        if (err) res.send(500, err.message);
        res.status(200).send("Deleted");
    });
};

/** GET Diet by diet._id**/
//  get /diets/:id
exports.getDietById = function (req, res) {
    dietModel.findOne({_id: req.params.dietid}, function (err, diet) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(diet);
    });
};
