var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');
var Publication = require('../models/publication');
var User = require('../models/user');
var Trainer = require('../models/trainer');
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable

/**POST add new user to DB - Register**/
router.post('/register', function (req, res) {
    console.log(req.body);
    var user = new User({
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
});

/**POST user login - authentication**/
router.post('/login', function (req, res) {
    User.findOne({
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
});

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

/**Used to check if the Token is valid**/
/**Everything after this is protected route**/
router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

/** UPDATE user by user._id**/
router.put('/users/:id', function (req, res) {
    User.findOneAndUpdate({id: req.params.id}, function (err) {
        if (err) res.send(500, err.message);
        var user = new User({
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
    });
});

/** DELETE user by user._id**/
router.delete('/users/:id', function (req, res) {
    User.findByIdAndRemove({_id: req.params.id}, function (err) {
        if (err) res.send(500, err.message);
        res.status(200).send("Deleted");
    });
});


/**GET User publications by User_ID**/
router.get('/users/publications/:userid', function (req, res) {
    User.findOne({userid: req.params.userid}, function (err, user) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(user.publications);
    });
});

/**POST User publications by User_ID**/
router.post('/users/publications/:userid', function (req, res) {
    User.findOne({userid: req.params.userid}, function (err, user) {
        user = user[0];
        var publication = new Publication({
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
            console.log(JSON.stringify(publication, null, "\t"));
            res.status(200).jsonp("What Happen?");
        });
});


/**UPDATE User publications by User_ID**/
router.put('/users/publications/:userid', function (req, res) {
    User.findIdAndUpdate({_id: req.params.user}, function (err, user) {
        if (err) res.send(500, err.message);
        user = user [0];
        var publication = {
            title: req.body.title,
            content: req.body.content,
            date: new Date()
        };
        user.publications.push(publication);
        user.save(function (err) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(user.publications);
        });
    });
});

/**DELETE User publications by User_ID**/
router.delete('/users/publications/:userid/:publicationid', function (req, res) {
    User.findByIdAndRemove({_id: req.params.userid}, function (err, user) {
        User.publications.findByIdAndRemove({
            _id: req.params.publicationid
        });
        res.status(200).jsonp(user.publications);
    });
});

/**GET list of all users**/
router.get('/users', function (req, res) {
    User.find(function (err, users) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(users);
    });
});

/**GET list of all users = CLIENTS**/
router.get('/users/clients', function (req, res) {
    User.find({role: req.params.role = 'client'}, function (err, users) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(users);
    });
});

/** GET user by user._id**/
router.get('/users/:id', function (req, res) {
    User.find({id: req.params.id}, function (err, user) {
        if (err) res.send(500, err.message);
        console.log(user);
        res.status(200).jsonp(user);
    });
});

/**GET list of all Trainers**/
router.get('/users/trainers', function (req, res) {
    Trainer.find(function (err, trainers) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(trainers);
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
