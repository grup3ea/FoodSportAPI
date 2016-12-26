var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {type: String, required: true, unique: true},
    role: {type: String, required: true},
    password: {type: String, required: true},
    token: {type: String},
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
    trainers: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainerModel'
    },
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
    }
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('userModel', userSchema);
