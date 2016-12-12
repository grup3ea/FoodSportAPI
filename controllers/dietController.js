var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable


var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');

exports.getDiets = function (req, res) {
    dietModel.find(function (err, diets) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(diets);
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


/**POST add new diet to DB - Register**/
exports.addDiet = function (req, res) {
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






exports.chooseDiet = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        user.diets.push(req.body.dietid);
        /* gamification */
        var reward={
          concept: "choosing diet",
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
exports.unchooseDiet = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        for(var i=0; i<user.diets.length; i++)
        {
          if(user.diets[i]==req.body.dietid)
          {//deletes the diets of the user with the dietid
            user.diets.splice(i, 1);
          }
        }
        /* gamification */
        var reward={
          concept: "unchoosing diet",
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
          concept: "diet day complete",
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
