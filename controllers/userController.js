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
var formidable = require('formidable');
var fs = require('fs');

app.set('superSecret', config.secret); // secret variable

/**POST add new user to DB - Register**/

/*** OK ***/

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
        },
        points:{
          total: 0
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

/*** OK ***/

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
                user.token="";
                var token = jwt.sign(user, app.get('superSecret'), {
                    //  expiresIn: 86400 // expires in 24 hours
                });

                user.token=token;
                user.save(function (err, user) {
                    if (err) res.send(500, err.message);

                    // return the information including token as JSON
                    user.password = "";
                    res.json({
                        user: user,
                        success: true,
                        message: 'Enjoy your token!',
                        token:  token
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

/*** Building a File Uploader with NodeJs
 * https://coligo.io/building-ajax-file-uploader-with-node/
 */

exports.avatarUpload = function (req, res){
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);
}

/** UPDATE user by user._id**/
//  put /users/:id
exports.updateUser = function (req, res) {
    var id = req.params.userid;
    var updates = req.body;


    userModel.update({"_id": id}, updates,
        function (err) {
            if (err) return console.log(err);
            console.log( updates);
            return res.sendStatus(202);
        });
}

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



exports.sendPetitionToTrainer = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'sending petition failed. user not found.'});
        }else if(user){
          console.log(user.name);//aquí potser caldria comprovar que la routine és la que han creat per l'user
          //ara busquem el trainer
          trainerModel.findOne({_id: req.params.trainerid}, function (err, trainer) {
              if (err) res.send(500, err.message);
              if(!trainer) {
                  res.json({success: false, message: 'sending petition failed. trainer not found.'});
              }else if(trainer){
                var newPetition={
                  clientid: user._id,
                  message: req.body.message,
                  state: "pendent"
                };
                trainer.clientsPetitions.push(newPetition);
                trainer.save(function (err) {
                    if (err) res.send(500, err.message);

                    res.status(200).jsonp(trainer);
                });
              }//end else if
          });
        }//end else if
    });
};
