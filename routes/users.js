var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');

var User = require('../models/user');
var config = require('../config/config'); // get our config file

var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable

//POST - Add User in DB
router.post('/register', function (req, res) {
    var user = new User({
        name: req.body.name,
        role: req.body.role,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        token:req.body.token,
        avatar: req.body.avatar
    });
    user.save(function (err, user) {
        if (err) return res.status(500).send(err.message);
        res.status(200).jsonp(user);
    });
});

//Check if user is in DB and provide him with a token
router.post('/login', function (req, res) {
    // find the user
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {
          //passa la password rebuda al hash
          req.body.password=crypto.createHash('sha256').update(req.body.password).digest('base64');

            // check if password matches
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 86400 // expires in 24 hours
                });
                user.token = token;
                res.json({
                    user: user,
                    success: true,
                    message: 'Enjoy your token!'
                });
            }
        }
    });
});

/**Logout & Invalidate Token so the user is really out**/
router.get('/logout', function logout(req, res, callback) {
    // invalidate the token
    var token = req.headers.authorization;
    // console.log(' >>> ', token)
    var decoded = verify(token);
    if (decoded) { // otherwise someone can force the server to crash by sending a bad token!
        // asynchronously read and invalidate
        db.get(decoded.auth, function (err, record) {
            if (err) throw err;
            var updated = JSON.parse(record);
            updated.valid = false;
            db.put(decoded.auth, updated, function (err) {
                if (err) throw err;
                // console.log('updated: ', updated)
                res.writeHead(200, {'content-type': 'text/plain'});
                res.end('Logged Out!');
                return callback(res);
            });
        });
    } else {
        authFail(res, done);
        return callback(res);
    }
});

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
    res.status(200).send();
});


/**Used to check if the Token is valid**/
/**Everything after this is protected route**/
router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

function getUser(res) {
    User.find(function (err, users) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(users);
    });
}

//GET - GET all users has to be a protected route
router.get('/users', function (req, res) {
    getUser();
});

//GET - Get a single user has to be a protected route
router.get('/users/profile',  function (req, res) {
    User.find({name: req.params.name}, function (err, user) {
        if (err) res.send(500, err.message);
        console.log(user);
        res.status(200).jsonp(user);
    });
});

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.status(401).send();
}

module.exports = router;
module.exports = getUser();
