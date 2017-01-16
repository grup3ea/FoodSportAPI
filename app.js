var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var expressValidator = require('express-validator');
var session = require('express-session');
var app = express();
var config = require('./config/config');
/**Inicio Express**/
var app = express();
var server = require('http').Server(app);
var secret = config.secret;
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
var userMdl = require('./models/userModel')(app, mongoose);
var userCtrl = require('./controllers/userController');
var dietMdl = require('./models/dietModel')(app, mongoose);
var dietCtrl = require('./controllers/dietController');
var routineMdl = require('./models/routineModel')(app, mongoose);
var routineCtrl = require('./controllers/routineController');
var trainerCtrl = require('./controllers/trainerController');
var chefMdl = require('./models/chefModel')(app, mongoose);
var chefCtrl = require('./controllers/chefController');
var publicationMdl = require('./models/publicationModel')(app, mongoose);
var publicationCtrl = require('./controllers/publicationController');
var conversationMdl = require('./models/conversationModel')(app, mongoose);
var conversationCtrl = require('./controllers/conversationController');
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
apiRoutes.route('/trainers/valorateTrainer/:trainerid')
    .post(trainerCtrl.valorateTrainer);
apiRoutes.route('/trainers/:trainerid/getNotifications')
    .get(trainerCtrl.getNotifications);
apiRoutes.route('/trainers/searchByName/:trainername')
    .get(trainerCtrl.searchByName);
apiRoutes.route('/trainers/searchByDiscipline/:discipline')
    .get(trainerCtrl.searchByDiscipline);

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
apiRoutes.route('/diets/choose')
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
