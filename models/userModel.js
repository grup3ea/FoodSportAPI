var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {type: String, required: true, unique: true},
    role: {type: String, required: true},
    password: {type: String, required: true},
    //token: {type: String},//el mantenim temporalment per permetre el funcionament de la resta
    tokens: [{
      userAgent: {type: String},
      token: {type: String},
      os: {type: String},
      browser: {type: String},
      device: {type: String},
      os_version: {type: String},
      browser_version: {type: String},
      ip: {type: String}
    }],
    email: {type: String, required: true, unique: true},
    description: {type: String},
    direction: {type: String},
    city: {type: String},
    avatar: {type: String},
    attributes: {
        height: {type: Number},
        weight: {type: Number},
        gender: {type: String},//Home, Dona, Altres -->com a mínim aquestes 3 opcions, més endavant tenim el debat de com s'enfoca
        age: {type: Number}
    },
    publications: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'publicationModel'
    }],
    facebook: {
        id: {type: String},
        token: {type: String},
        email: {type: String},
        name: {type: String}
    },
    twitter: {
        /*id: {type: String},
         token: {type: String},
         displayName: {type: String},
         username: {type: String}*/
        name: {type: String},
        provider: {type: String},
        provider_id: {type: String},
        photo: {type: String},
        createdAt: {type: Date, default: Date.now}

    },
    google: {
        id: {type: String},
        token: {type: String},
        email: {type: String},
        name: {type: String}
    },
    diets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dietModel'
    }],
    trainers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainerModel'
    }],
    routines: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'routineModel'
    }],
    points: {
      total: {type: Number},
      history: [{
        concept: {type: String},
        date: {type: Date},
        value: {type: Number}
      }]
    },
    notifications: [{
      state: {type: String},//viewed, pendent
      message: {type: String},
      link: {type: String},//aquí oju, a la app i a la web calen links diferents, però ho podem fer posant sempre a la app i a la web el prefix del link (#!/app) o (#/app/), i després afegint-hi la pàgina on volem enviar el routing, per exemple (dashboard)
      icon: {type: String},
      date: {type: Date},
      dateviewed: {type: Date}
    }]
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('userModel', userSchema);
