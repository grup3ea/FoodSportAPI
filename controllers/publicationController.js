var express = require('express');
var app = express();
var passport = require('passport');
var publicationModel = require('../models/publicationModel');
var userModel = require('../models/userModel');
var trainerModel = require('../models/trainerModel');
var config = require('../config/config'); // get our config file
var crypto = require('crypto');


/**POST User publications by User_ID**/
//  post /users/publications/:userid
exports.postUserPublicationsByUserId = function (req, res) {
    userModel.findOne({_id: req.params.userid}, function (err, user) {
        if (err !== null) res.send(500, err.message);
        user = user[0];
        var publication = new publicationModel({
            title: req.body.title,
            content: req.body.content,
            created: new Date()
        });
        user.publications.push(publication);
        user.save(function (err) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(user.publications);
        });
    }).populate('publications')
        .exec(function (error, publication) {
            if (error !== null) res.send(500, error.message);
            console.log(JSON.stringify(publication, null, "\t"));
            res.status(200).jsonp("What Happen?");
        });
};

/**GET User publications by User_ID**/
//  get /users/publications/:userid
exports.getUserPublicationsByUserId = function (req, res) {
    userModel.findOne({userid: req.params.userid}, function (err, user) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(user.publications);
    });
};

/**UPDATE User publications by User_ID**/
//  put /users/publications/:userid
exports.putUserPublicationsByUserId = function (req, res) {
    publicationModel.findIdAndUpdate({_id: req.params.userid}, function (err, user) {
        if (err) res.send(500, err.message);
        user = user [0];
        var publication = {
            title: req.body.title,
            content: req.body.content,
            date: new Date()
        };
        user.publications.push(publication);
        user.save(function (err) {
            if (err !== null) return res.send(500, err.message);
            res.status(200).jsonp(user.publications);
        });
    }).populate('publications')
        .exec(function (error, publication) {
            if (error !== null) res.send(500, error.message);
            console.log(JSON.stringify(publication, null, "\t"));
            res.status(200).jsonp("Update happen?");
        });
};

/**DELETE User publications by publication ID**/
exports.deletePublicationById = function (req, res) {
    publicationModel.findByIdAndRemove({_id: req.params.publicationid}, function (err) {
        if (err !== null) return res.send(500, err.message);
        res.status(200).jsonp('Deleted');
    });
};