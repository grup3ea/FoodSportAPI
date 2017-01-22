var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var https = require('https');
var expressValidator = require('express-validator');
var session = require('express-session');
var app = express();
var config = require('./config/config');
/**Inicio Express**/
var app = express();
var server = require('http').Server(app);
var secret = config.secret;


var passport = require('passport');
require('./config/passport')(passport);
var configAuth = require('./config/auth');
var google = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;

var options = {
    key  : fs.readFileSync('server.key'),
    cert : fs.readFileSync('server.crt')
};

/** Express Session **/
app.use(session({
    secret: secret,
    saveUninitialized: true,
    resave: true
}));
/**Set Static Folder**/
app.use(express.static(__dirname + '/public'));
app.set('superSecret', secret);
/** Express Validator **/
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'), root = namespace.shift(), formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));
/**Middlewares express**/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
/** developing mode **/
/** use morgan to log requests to the console**/
var morgan = require('morgan');
app.use(morgan('dev'));
/**CORS Filter**/
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    next();
});
app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + config.port + '/api');
});
/**------------------------------------------------------------------ **/
/**--------------------IMPORT of Models & Controllers---------------- **/
/**------------------------------------------------------------------ **/
var userMdl = require('./models/userModel');
var userCtrl = require('./controllers/userController');
var dietMdl = require('./models/dietModel')(app, mongoose);
var dietCtrl = require('./controllers/dietController');
var routineMdl = require('./models/routineModel')(app, mongoose);
var routineCtrl = require('./controllers/routineController');
var trainerCtrl = require('./controllers/trainerController');
var chefCtrl = require('./controllers/chefController');
var publicationMdl = require('./models/publicationModel')(app, mongoose);
var publicationCtrl = require('./controllers/publicationController');
var conversationMdl = require('./models/conversationModel')(app, mongoose);
var conversationCtrl = require('./controllers/conversationController');
var contactModel = require('./models/contactModel')(app, mongoose);
var contactCtrl = require('./controllers/contactController');
var adminCtrl = require('./controllers/adminController');
var runMdl = require('./models/runModel')(app, mongoose);
var runCtrl = require('./controllers/runController');

/**------------------------------------------------------------------ **/
/**-----------------------------API routes--------------------------- **/
/**------------------------------------------------------------------ **/
var apiRoutes = express.Router();
/**------------------------------------------------------------------ **/
/**----------------------API routes UNprotected---------------------- **/
/**------------------------------------------------------------------ **/
/**Users**/
apiRoutes.route('/users/register')
    .post(userCtrl.register);
apiRoutes.route('/users/login')
    .post(userCtrl.login);
apiRoutes.route('/logout')
    .post(userCtrl.logout);
/**Chefs**/
apiRoutes.route('/chefs/register')
    .post(chefCtrl.register);
apiRoutes.route('/chefs/login')
    .post(chefCtrl.login);
apiRoutes.route('/chefs')
    .get(chefCtrl.getChefs);
apiRoutes.route('/chefs/:chefid')
    .get(chefCtrl.getChefById);
/**Trainers**/
apiRoutes.route('/trainers/register')
    .post(trainerCtrl.register);
apiRoutes.route('/trainers/login')
    .post(trainerCtrl.login);
apiRoutes.route('/trainers')
    .get(trainerCtrl.getTrainers);
apiRoutes.route('/trainers/:trainerid')
    .get(trainerCtrl.getTrainerById);
apiRoutes.route('/trainers/searchByDiscipline')
    .post(trainerCtrl.searchByDiscipline);
/**Diets**/
apiRoutes.route('/diets')
    .get(dietCtrl.getDiets);
apiRoutes.route('/diets/:dietid')
    .get(dietCtrl.getDietById);
/**Routines**/
apiRoutes.route('/routines')
    .get(routineCtrl.getRoutines);
apiRoutes.route('/routines/:routineid')
    .get(routineCtrl.getRoutineById);
/**Contact**/
apiRoutes.route('/contacts')
    .get(contactCtrl.getContacts)
    .post(contactCtrl.createContact);
apiRoutes.route('/contacts/:contactid')
    .get(contactCtrl.getContactById);

passport.use(new TwitterStrategy({
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL
}, function(token, refreshToken, profile, done) {
        console.log("profile");
        //console.log(profile);

        userMdl.findOne({ 'twitter.id' : profile.id }, function(err, user) {
console.log("usermodel");
            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
            {
                console.log(err);
                return done(err);
            }

            // if the user is found then log them in
            if (user) {
                console.log("user exists");
                return done(null, user); // user found, return that user
            } else {
                console.log("user no exists");
                // if there is no user, create them
                var newUser                 = new userMdl();

                // set all of the user data that we need
                newUser.twitter.id          = profile.id;
                newUser.twitter.token       = token;
                newUser.twitter.username    = profile.username;
                newUser.twitter.displayName = profile.displayName;


                newUser.avatar      = profile.profile_image_url;
                newUser.background  = profile.profile_background_image_url;
                newUser.name = profile.displayName;
                newUser.role = "user";
                newUser.email = profile.username + "@web.com";

                console.log("saving");

                // save our user into the database
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    console.log("saved");
                    return done(null, newUser);
                });
            }
        });

}));
apiRoutes.get('/auth/twitter', passport.authenticate('twitter'));
apiRoutes.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect : '/api/profile',
        failureRedirect : '/'
    }, function(req, res) {
        // Successful authentication
        console.log("success callback");
    }
));
/**------------------------------------------------------------------ **/
/**-----------------------API routes Protected----------------------- **/
/**------------------------------------------------------------------ **/
/**Used to check if the Token is valid**/
/**Everything after this is protected route**/
/** start of TOKEN MATCHING **/

apiRoutes.use(function (req, res, next) {
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
/** end of TOKEN MATCHING **/

/** ********** **/
/******GLOBAL*****/
/** ********** **/

apiRoutes.route('/search/:searchstring')
    .get(userCtrl.search);

/** ********** **/
/******USERS*****/
/** ********** **/

apiRoutes.route('/users')
    .get(userCtrl.getUsers);
apiRoutes.route('/users/:userid')
    .get(userCtrl.getUserById)
    .put(userCtrl.updateUser)
    .delete(userCtrl.deleteUserById);
apiRoutes.route('/users/upload')
    .post(userCtrl.avatarUpload);
apiRoutes.route('/users/:userid/diets')
    .get(userCtrl.getDietsFromUserId);
apiRoutes.route('/users/:userid/routines')
    .get(userCtrl.getRoutinesFromUserId);
apiRoutes.route('/users/:userid/publications')
    .get(publicationCtrl.getUserPublicationsByUserId);
apiRoutes.route('/users/sendPetitionToTrainer/:trainerid')
    .post(userCtrl.sendPetitionToTrainer);
apiRoutes.route('/notifications')
    .get(userCtrl.getNotifications);
apiRoutes.route('/notificationsNumber')
    .get(userCtrl.getNumberOfNotifications);
apiRoutes.route('/users/:userid/deleteSelectedTokens')
    .post(userCtrl.deleteSelectedTokens);
apiRoutes.route('/users/follow')
    .post(userCtrl.follow);
apiRoutes.route('/users/unfollow')
    .post(userCtrl.unfollow);
apiRoutes.route('/users/:userid/network')
    .get(userCtrl.getUserNetworkById);
apiRoutes.route('/users/:userid/suggestions')
    .get(userCtrl.getUserSuggestionsById);
apiRoutes.route('/users/newMark')
    .post(userCtrl.newMark);
apiRoutes.route('/users/marks/:markid')//no podiem posar directament /users/:marksid, pq llavors pilla com si fos /users/:userid i no té forma de saber que ens referim a una mark
    .delete(userCtrl.deleteUserMark);
apiRoutes.route('/users/marks/:markid/addDayToMark')
    .post(userCtrl.addDayToMark);

/** *********** **/
/*** TRAINERS ****/
/** *********** **/

apiRoutes.route('/trainers/:trainerid')
    .put(trainerCtrl.updateTrainer)
    .delete(trainerCtrl.removeTrainer);
apiRoutes.route('/trainers/acceptClientPetition')
    .post(trainerCtrl.acceptClientPetition);
apiRoutes.route('/trainers/valorate/:trainerid')
    .post(trainerCtrl.valorateTrainer);
apiRoutes.route('/trainers/:trainerid/getNotifications')
    .get(trainerCtrl.getNotifications);
apiRoutes.route('/trainers/searchByName/:trainername')
    .get(trainerCtrl.searchByName);
apiRoutes.route('/trainers/searchByDiscipline/:discipline')
    .get(trainerCtrl.searchByDiscipline);
apiRoutes.route('/trainersSuggestionsByDisciplines')
    .get(trainerCtrl.getTrainersByDisciplinesArray);

/** ********** **/
/******CHEFS*****/
/** ********** **/

apiRoutes.route('/chefs/:chefid')
    .put(chefCtrl.updateChefById)
    .delete(chefCtrl.deleteChefById);

/** ********** **/
/******DIETS*****/
/** ********** **/

apiRoutes.route('/diets')
    .post(dietCtrl.createDiet);
apiRoutes.route('/diets/:dietid/days')
    .post(dietCtrl.addDayToDiet);
apiRoutes.route('/diets/:dietid')
    .delete(dietCtrl.deleteDietById)
    .put(dietCtrl.updateDietById);
apiRoutes.route('/diets/choose/:dietid')
    .post(dietCtrl.chooseDiet)
    .delete(dietCtrl.unchooseDiet);
apiRoutes.route('/diets/completeDay/:dietid')
    .post(dietCtrl.completeDayGamificatedDiet);

/** ********** **/
/****ROUTINES****/
/** ********** **/

apiRoutes.route('/routines/addToClient/:clientid')
    .post(routineCtrl.addRoutineToClient);
apiRoutes.route('/routines/:routineid/days')
    .post(routineCtrl.addDayToRoutine);
apiRoutes.route('/routines/choose')
    .post(routineCtrl.chooseRoutine)
    .delete(routineCtrl.unchooseRoutine);
apiRoutes.route('/routines/:routineid')
    .delete(routineCtrl.deleteRoutineById)
    .put(routineCtrl.updateRoutineById);
apiRoutes.route('/routines/completeDay/:routineid')
    .post(routineCtrl.completeDayGamificatedRoutine);

/** ********** **/
/**PUBLICATIONS**/
/** ********** **/

apiRoutes.route('/publications')
    .get(publicationCtrl.getAllPublications)
    .post(publicationCtrl.postPublication);
apiRoutes.route('/publications/getById/:publicationid')
    .get(publicationCtrl.getPublicationById);
apiRoutes.route('/publications/:publicationid/like')
    .post(publicationCtrl.likePublication);
apiRoutes.route('/publications/:publicationid/dislike')
    .post(publicationCtrl.dislikePublication);
apiRoutes.route('/publications/:publicationid')
    .delete(publicationCtrl.deletePublicationById);
apiRoutes.route('/publications/newsfeed')
    .get(publicationCtrl.getNewsFeed);

/** ********** **/
/**CONVERSATIONS**/
/** ********** **/

apiRoutes.route('/conversations')
    .get(conversationCtrl.getUserConversations)
    .post(conversationCtrl.createConversation);
apiRoutes.route('/conversations/:conversationid')
    .post(conversationCtrl.addMessageToConversation);

/** ********** **/
/**RUNS**/
/** ********** **/

apiRoutes.route('/runs')
    .post(runCtrl.postRun);
apiRoutes.route('/runs/byUserId/:userid')
    .get(runCtrl.getRunsByUserId);
apiRoutes.route('/runs/byRunId/:runid')
    .get(runCtrl.getRunByRunId);


/** ********** **/
/**ADMIN**/
/** ********** **/

apiRoutes.route('/admin/users')
    .get(adminCtrl.getUsers);

apiRoutes.route('/admin/nodesMap/:userid')
    .get(adminCtrl.getUserById);

app.use('/api', apiRoutes);
/**-------------------------------------------------------------**/
/**--------------------END of API routes------------------------**/
/**-------------------------------------------------------------**/

/**Conexión a la base de datos de MongoDB que tenemos en local**/
mongoose.Promise = global.Promise;
require('mongoose-middleware').initialize(mongoose);
mongoose.connect(config.database, function (err) {
    if (err) throw err;
    console.log('Conectado con éxito a la Base de Datos');
});
/** Start server **/
server.listen(config.port, function () {
    console.log("Servidor en http://localhost:" + config.port);
});

https.createServer(options, app).listen(3000, function () {
    console.log('Started!');
});
