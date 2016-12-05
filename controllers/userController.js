var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');
var publicationModel = require('../models/publicationModel');
var userModel = require('../models/userModel');
var trainerModel = require('../models/trainerModel');
var dietModel = require('../models/dietModel');
var routineModel = require('../models/routineModel');
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable

/**POST add new user to DB - Register**/
exports.register = function (req, res) {
    console.log(req.body);
    var user = new userModel({
        name: req.body.name,
        role: req.body.role,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        description: req.body.description,
        avatar: req.body.avatar,
        attributes: {
            height: req.body.height,
            weight: req.body.weight,
            gender: req.body.gender,
            age: req.body.age
        }
    });
    user.save(function (err, user) {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err.message);
        }
        res.status(200).jsonp(user);
    });
};

/**POST user login - authentication**/
exports.login = function (req, res) {
    userModel.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {
            req.body.password = crypto.createHash('sha256').update(req.body.password).digest('base64');
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
                var token = jwt.sign(user, app.get('superSecret'), {
                    //  expiresIn: 86400 // expires in 24 hours
                });
                user.token = token;

                user.save(function (err, user) {
                    if (err) res.send(500, err.message);

                    // return the information including token as JSON
                    user.password = "";
                    res.json({
                        user: user,
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                });
            }
        }
    });
};

/**Logout & Invalidate Token so the user is really out**/
exports.logout = function (req, res, callback) {
    var token = req.headers.authorization;
    var decoded = verify(token);
    if (decoded) {
        db.get(decoded.auth, function (err, record) {
            if (err) throw err;
            var updated = JSON.parse(record);
            updated.valid = false;
            db.put(decoded.auth, updated, function (err) {
                if (err) throw err;
                res.writeHead(200, {'content-type': 'text/plain'});
                res.end('Logged Out!');
                return callback(res);
            });
        });
    } else {
        authFail(res, done);
        return callback(res);
    }
};

/** Rutas de Passport **/
// Ruta para desloguearse
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
// Ruta para autenticarse con Twitter (enlace de login)
router.get('/auth/twitter', passport.authenticate('twitter'));
// Ruta para autenticarse con Facebook (enlace de login)
router.get('/auth/facebook', passport.authenticate('facebook'));
// Ruta de callback, a la que redirigirá tras autenticarse con Twitter.
// En caso de fallo redirige a otra vista '/login'
router.get('/auth/twitter/callback', passport.authenticate('twitter',
    {successRedirect: '/', failureRedirect: '/login'}
));
// Ruta de callback, a la que redirigirá tras autenticarse con Facebook.
// En caso de fallo redirige a otra vista '/login'
router.get('/auth/facebook/callback', passport.authenticate('facebook',
    {successRedirect: '/', failureRedirect: '/login'}
));
/* fin de rutas de passport */


/** UPDATE user by user._id**/
//  put /users/:id

exports.updateUserById = function (req, res) {
    var userupdated = new userModel({
        name: req.body.name,
        role: req.body.role,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        email: req.body.email,
        description: req.body.description,
        avatar: req.body.avatar,
        attributes: {
            height: req.body.height,
            weight: req.body.weight,
            gender: req.body.gender,
            age: req.body.age
        }
    });
    userModel.findOneAndUpdate({_id: req.params.id}, userupdated, function (err) {
        if (err) res.send(500, err.message);
        res.status(204).jsonp(user);
    });
};

/** DELETE user by user._id**/
//  /users/:id
exports.deleteUserById = function (req, res) {
    userModel.findByIdAndRemove({_id: req.params.userid}, function (err) {
        if (err) res.send(500, err.message);
        res.status(200).send("Deleted");
    });
};

/**GET list of all users**/
// get /users
exports.getUsers = function (req, res) {
    userModel.find(function (err, users) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(users);
    });
};

/** GET user by user._id**/
//  get /users/:id
exports.getUserById = function (req, res) {
    userModel.findOne({_id: req.params.userid})
        .populate('diets')
        .populate('routines')
        .exec(function (err, user) {
            if (err) res.send(500, err.message);
            res.status(200).jsonp(user);
        });
};


///users/:userid/diets
exports.getDietsFromUserId = function (req, res) {
    userModel.findOne({_id: req.params.userid})
        .populate('diets')
        .exec(function (err, user) {
            if (err) res.send(500, err.message);

            res.status(200).jsonp(user.diets);
        });
};
///users/:userid/routines
exports.getRoutinesFromUserId = function (req, res) {
    userModel.findOne({_id: req.params.userid})
        .populate('routines')
        .exec(function (err, user) {
            if (err) res.send(500, err.message);

            res.status(200).jsonp(user.routines);
        });
};


exports.addDietToUser = function (req, res) {
    userModel.findOne({_id: req.params.userid}, function (err, user) {
        if (err) res.send(500, err.message);
        console.log(user);
        user.diets.push(req.body.dietid);
        user.save(function (err) {
            if (err) res.send(500, err.message);

            res.status(200).jsonp(user);
        })
    });
};
exports.addRoutineToUser = function (req, res) {
    userModel.findOne({_id: req.params.userid}, function (err, user) {
        if (err) res.send(500, err.message);
        console.log(user);
        user.routines.push(req.body.routineid);
        user.save(function (err) {
            if (err) res.send(500, err.message);

            res.status(200).jsonp(user);
        })
    });
};
