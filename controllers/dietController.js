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
