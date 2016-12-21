var express = require('express');
var app = express();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable

var chefModel = require('../models/chefModel');
var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');

exports.getChefs = function (req, res) {
    chefModel.find(function (err, chefs) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(chefs);
    });
};
exports.getChefById = function (req, res) {
    chefModel.findOne({_id: req.params.chefid})
        .populate('diets')
        .exec(function (err, chef) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(chef);
        });
};

exports.register = function (req, res) {
    var chef = new chefModel({
        name: req.body.name,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email
    });
    chef.save(function (err, chef) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(chef);
    });
};
exports.login = function (req, res) {
    chefModel.findOne({
        email: req.body.email
    }, function (err, chef) {
        if (err) throw err;
        if (!chef) {
            res.json({success: false, message: 'Authentication failed. chef not found.'});
        } else if (chef) {
            req.body.password = crypto.createHash('sha256').update(req.body.password).digest('base64');
            if (chef.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
                var token = jwt.sign(chef, app.get('superSecret'), {
                    //  expiresIn: 86400 // expires in 24 hours
                });
                chef.token = token;

                chef.save(function (err, chef) {
                    if (err) res.send(500, err.message);

                    // return the information including token as JSON
                    chef.password = "";
                    res.json({
                        user: chef,
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                });
            }
        }
    });
};
