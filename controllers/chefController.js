var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var crypto = require('crypto');

app.set('superSecret', config.secret);

/*******MODELS*********/
var chefModel = require('../models/chefModel');
var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');

/**GET '/chefs' **/
exports.getChefs = function (req, res) {
    chefModel.find(function (err, chefs) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(chefs);
    });
};

/** GET '/chefs/:chefid' **/
exports.getChefById = function (req, res) {
    chefModel.findOne({_id: req.params.chefid})
        .lean()
        .populate('diets', 'title description')
        .exec(function (err, chef) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(chef);
        });
};

/** POST '/chefs/register' **/
exports.register = function (req, res) {
    var chef = new chefModel({
        name: req.body.name,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        role: req.body.role
    });
    chef.save(function (err, chef) {
        if (err) return res.send(500, err.message);
        res.status(200).jsonp(chef);
    });
};

/** POST '/chefs/login' **/
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
                var indexToken = -1;
                for (var i = 0; i < chef.tokens.length; i++) {
                    if (chef.tokens[i].userAgent == req.body.userAgent) {
                        indexToken = JSON.parse(JSON.stringify(i));
                    }
                }
                console.log(indexToken);
                if (indexToken == -1) {//userAgent no exist

                    var tokenGenerated = jwt.sign({foo: 'bar'}, app.get('superSecret'), {
                        //  expiresIn: 86400 // expires in 24 hours
                    });
                    var newToken = {
                        userAgent: req.body.userAgent,
                        token: tokenGenerated
                    };
                    chef.tokens.push(newToken);
                } else {//userAgent already exist
                    chef.tokens[indexToken].token = "";

                    var tokenGenerated = jwt.sign({foo: 'bar'}, app.get('superSecret'), {
                        //  expiresIn: 86400 // expires in 24 hours
                    });
                    chef.tokens[indexToken].token = tokenGenerated;
                }
                chef.save(function (err, chef) {
                    if (err) return res.send(500, err.message);

                    // return the information including token as JSON
                    chef.password = "";
                    res.json({
                        user: chef,
                        success: true,
                        message: 'Enjoy your token!',
                        token: tokenGenerated
                    });
                });
            }
        }
    });
};
