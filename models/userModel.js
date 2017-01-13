var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: {type: String, required: true, unique: true},
    surname: {type: String, required: true, unique: true},
    role: {type: String, required: true},
    password: {type: String, required: true, select: false},
    //token: {type: String},//el mantenim temporalment per permetre el funcionament de la resta
    tokens: [{
        userAgent: {type: String},
        token: {type: String},
        os: {type: String},
        browser: {type: String},
        device: {type: String},
        os_version: {type: String},
        browser_version: {type: String},
        ip: {type: String},
        lastLogin: {type: Date},
        birthdate: {type: Date},
    }],
    email: {type: String, required: true, unique: true},
    description: {type: String},
    direction: {type: String},
    city: {type: String},
    avatar: {type: String},
    background: {type: String},
    attributes: {
        height: {type: Number},
        weight: {type: Number},
        gender: {type: String},//Home, Dona, Altres -->com a mínim aquestes 3 opcions, més endavant tenim el debat de com s'enfoca
        age: {type: Number}
    },
    publications: [{
        type: mongoose.Schema.Types.ObjectId,
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
        ref: 'userModel'
    }],
    routines: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'routineModel'
    }],// trainermodel
    disciplines : [{
        name: {type: String}
    }],
    clients: [{
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
      },
      petitionMessage: {type: String},
      date: {type: Date}
    }],
    clientsPetitions: [{
      clientid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'userModel'
      },
      message: {type: String},
      state: {type: String}//pendent, accepted, declined
    }],
    valorations: [{
      clientid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'userModel'
      },
      date: {type: Date},
      message: {type: String},//missatge de valoració
      value: {type: Number}//per exemple sistema d'estrelles sobre 5
  }],//end of trainermodel
    points: {
        total: {type: Number},
        history: [{
            concept: {type: String},
            date: {type: Date},
            value: {type: Number}
        }]
    },
    marks: [{
        title: {type: String},
        unit: {type: String},//si són kg, km
        best: {
            date: {type: Date},
            value: {type: String}
        },
        days:[{
            date: {type: Date},
            value: {type: String}
        }]
    }],
    notifications: [{
        state: {type: String},//viewed, pendent
        message: {type: String},
        link: {type: String},//aquí oju, a la app i a la web calen links diferents, però ho podem fer posant sempre a la app i a la web el prefix del link (#!/app) o (#/app/), i després afegint-hi la pàgina on volem enviar el routing, per exemple (dashboard)
        icon: {type: String},
        date: {type: Date},
        dateviewed: {type: Date}
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }]
});
userSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('userModel', userSchema);
