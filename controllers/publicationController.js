var express = require('express');
var app = express();
var passport = require('passport');
var publicationModel = require('../models/publicationModel');
var userModel = require('../models/userModel');
var trainerModel = require('../models/trainerModel');
var config = require('../config/config'); // get our config file
var crypto = require('crypto');


/**POST publications with token as identifier**/
//  post /users/publications/:userid
exports.postPublication = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        //aquí ja hem agafat el user a partir del seu token
        var publication = new publicationModel({
            title: req.body.title,
            content: req.body.content,
            created: new Date(),
            owner: user._id
        });
        //fins aquí tenim la variable publication amb els continguts
        //ara cal 1r guardar el model publication a la base de dades
        publication.save(function(err, publication){
            if (err) res.send(500, err.message);

            //i 2n, afegir la id de la publicació generada al user.publications
            userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
                if (err) res.send(500, err.message);
                user.publications.push(publication._id);
                user.save(function (err) {
                    if (err) return res.send(500, err.message);
                    res.status(200).jsonp(publication);
                });
            });
        });
    });
};

/**GET User publications by User_ID**/
//  get /users/:userid/publications Putos populates que no salen los fuckers
exports.getUserPublicationsByUserId = function (req, res) {
    userModel.findOne({_id: req.params.userid}, function (err, user) {
        if (err) res.send(500, err.message);
    }).populate('publications')
        .exec(function (error, user) {
            if (error !== null) res.send(500, error.message);
            console.log(JSON.stringify(user, null, "\t"));
            res.status(200).jsonp(user.publications);
        });
};

/**UPDATE User publications by User_ID**/
//  put /users/:userid/publications
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
//delete /publications/:publicationid
exports.deletePublicationById = function (req, res) {
    publicationModel.findByIdAndRemove({_id: req.params.publicationid}, function (err) {
        if (err !== null) return res.send(500, err.message);
        res.status(200).jsonp('Deleted');
    });
};
