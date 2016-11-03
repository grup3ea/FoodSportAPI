var express = require('express');
var app = express();
var router = express.Router();
var User = require('../models/user.js');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config/config'); // get our config file
app.set('superSecret', config.secret); // secret variable


//GET - GET all users
router.get('/users', function (req, res) {
    User.find(function (err, users) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(users);
    });

});

//GET - Get a single user
router.get('/users/:name', function (req, res) {
    console.log('GET user: '+req.params.name);
    User.find({name: req.params.name}, function (err, user) {
        if (err) res.send(500, err.message);
        console.log(user);
        res.status(200).jsonp(user);
    });
});

//POST - Add User in DB
router.post('/register',  function (req, res) {
    var name = req.body.name;

    var user = new User({
        name:       req.body.name,
        role:       req.body.role,
        password:   req.body.password,
        email:      req.body.email
        //token
    });
    user.save(function(err, user) {
        if(err) return res.status(500).send(err.message);
        res.status(200).jsonp(user);
    });
});


//POST - Comprovar user en DB
router.post('/login',  function (req, res) {

    User.findOne({name:req.body.name},function(err, user) {
        if (err) res.send(500, err.message);

        else if (user==null){
            return res.status(404).jsonp({"loginSuccessful": false, "email": req.body.name});
        }
        else{
            var usuario = JSON.stringify(user);
            var pwd1 = JSON.stringify(req.body.password);
            if (pwd1 != 0) {
                console.log ("Login Correcto");
                return res.status(200).jsonp({"loginSuccessful": true, "user": user});
            }
            else {
                return res.status(404).jsonp({"loginSuccessful": false, "email": req.body.email});
            }
        }
    });
});

router.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

module.exports = router;
