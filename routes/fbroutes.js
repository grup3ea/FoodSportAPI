var express = require('express');
var passport = require('passport');
var app = express();
var router = express.Router();
var User = require('../models/user');
var config = require('../config/config');

// =====================================
    // LOGIN ===============================
    // =====================================

    // process the login form

    router.post('/fblogin', passport.authenticate('local-login', {
        successMessage: 'You Logged with FB', // redirect to the secure profile section
        failureMessage: 'You couldn Log with FACE. This might be good', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================

    // process the signup form
    router.post('/signup', passport.authenticate('local-signup', {
        successMessage: 'Yo, You registered with Faisbuk', // redirect to the secure profile section
        failureMessage: 'Yo, No facebook for you. This might be good...', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    router.get('/profile', isLoggedIn, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(users);
        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successMessage: 'FB Authenticated',
            failureMessage: 'NO FB Auth'
        }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    router.get('/fblogout', function (req, res) {
        req.logout();
        res.send(200);
    });

module.exports = router;
module.exports = passport;

// route middleware to make sure user is logged
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.send(401);
}