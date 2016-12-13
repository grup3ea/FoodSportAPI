var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
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
var trainerMdl = require('./models/trainerModel')(app, mongoose);
var trainerCtrl = require('./controllers/trainerController');
var chefMdl = require('./models/chefModel')(app, mongoose);
var chefCtrl = require('./controllers/chefController');
var publicationMdl = require('./models/publicationModel')(app, mongoose);
var publicationCtrl = require('./controllers/publicationController');


/**------------------------------------------------------------------ **/
/**-----------------------------API routes--------------------------- **/
/**------------------------------------------------------------------ **/
var apiRoutes = express.Router();

apiRoutes.route('/register')
    .post(userCtrl.register);
apiRoutes.route('/trainers/register')
    .post(trainerCtrl.register);
apiRoutes.route('/chefs/register')
    .post(chefCtrl.register);
/** Coge todos los parametros attributes de manera correcta **/
apiRoutes.route('/login')
    .post(userCtrl.login);
apiRoutes.route('/trainers/login')
    .post(trainerCtrl.login);
apiRoutes.route('/chefs/login')
    .post(chefCtrl.login);
/** Parece devolver bien el token **/
apiRoutes.route('/logout')
    .post(userCtrl.logout);

apiRoutes.route('/diets')
    .get(dietCtrl.getDiets);
apiRoutes.route('/diets/:dietid')
    .get(dietCtrl.getDietById);


apiRoutes.route('/routines')
    .get(routineCtrl.getRoutines);
apiRoutes.route('/routines/:routineid')
    .get(routineCtrl.getRoutineById);


apiRoutes.route('/trainers')
    .get(trainerCtrl.getTrainers);
apiRoutes.route('/trainers/:trainerid')
    .get(trainerCtrl.getTrainerById);
apiRoutes.route('/chefs')
    .get(chefCtrl.getChefs);
apiRoutes.route('/chefs/:chefid')
    .get(chefCtrl.getChefById);

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
/******USERS*****/
/** ********** **/

apiRoutes.route('/users')
    .get(userCtrl.getUsers);
apiRoutes.route('/users/:userid')
    .get(userCtrl.getUserById)
    .put(userCtrl.updateUserById)
    .delete(userCtrl.deleteUserById);
apiRoutes.route('/users/:userid/diets')
    .get(userCtrl.getDietsFromUserId);
apiRoutes.route('/users/:userid/routines')
    .get(userCtrl.getRoutinesFromUserId);
apiRoutes.route('/users/:userid/publications')
    .get(publicationCtrl.getUserPublicationsByUserId);

/*****************/
/*** TRAINERS ****/
/*****************/

apiRoutes.route('/trainers/:trainerid')
    .put(trainerCtrl.updateTrainer)
    .delete(trainerCtrl.removeTrainer);

apiRoutes.route('/trainers/:id/client')
    .post(trainerCtrl.TrainerNewClient);

apiRoutes.route('/trainers/:id/client/:client_id')
    .delete(trainerCtrl.TrainerRemoveClient);

apiRoutes.route('/trainers/:id/routine')
    .post(trainerCtrl.TrainerNewRoutine);

apiRoutes.route('/trainers/:id/routine/:routine_id')
    .delete(trainerCtrl.TrainerRemoveRoutine);

/** ********** **/
/******DIETS*****/
/** ********** **/

 apiRoutes.route('/diets')
     .post(dietCtrl.addDiet);
 apiRoutes.route('/diets/:dietid/days')
     .post(dietCtrl.addDayToDiet);
 apiRoutes.route('/diets/deleteDiet/:dietid')//he canviat la ruta temporalment fins que la definim, pq colisionava amb la ruta de unchoose diet
     .delete(dietCtrl.deleteDietById);


apiRoutes.route('/diets/choose')
    .post(dietCtrl.chooseDiet)
    .delete(dietCtrl.unchooseDiet);

apiRoutes.route('/diets/completeDay')
    .post(dietCtrl.completeDay);

/** ********** **/
/****ROUTINES****/
/** ********** **/

 apiRoutes.route('/routines')
     .post(routineCtrl.addRoutine);
 apiRoutes.route('/routines/:routineid/days')
     .post(routineCtrl.addDayToRoutine);

apiRoutes.route('/routines/choose')
   .post(routineCtrl.chooseRoutine)
   .delete(routineCtrl.unchooseRoutine);
apiRoutes.route('/routines/completeDay')
   .post(routineCtrl.completeDay);
/** ********** **/
/**PUBLICATIONS**/
/** ********** **/

apiRoutes.route('/publications')
    .post(publicationCtrl.postPublication);


app.use('/api', apiRoutes);

/**-------------------------------------------------------------**/
/**--------------------END of API routes------------------------**/
/**-------------------------------------------------------------**/

/**Conexión a la base de datos de MongoDB que tenemos en local**/
mongoose.Promise = global.Promise;
require('mongoose-middleware').initialize(mongoose);
mongoose.connect(config.database, function (err, res) {
    if (err) throw err;
    console.log('Conectado con éxito a la Base de Datos');
});

/** Start server **/
server.listen(config.port, function () {
    console.log("Servidor en http://localhost:" + config.port);
});
