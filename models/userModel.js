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
    avatar: {type: String},
    attributes: {
        height: {type: String},
        weight: {type: String},
        gender: {type: String},
        age: {type: String}
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
    diets: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dietModel'
    },
    coaching: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainerModel'
    },
    routines: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'routineModel'
    }
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('userModel', userSchema);
