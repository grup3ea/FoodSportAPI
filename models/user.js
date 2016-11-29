var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');
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
    publications: {
        title: {type: String},
        date: {type: Date},
        content: {type: String}
    },
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
        ref: 'dietSchema'
    },
    coaching: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainerSchema'
    },
    routines: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'routineSchema'
    }
});

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) return err.message;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function (password) {
    var user = this;
    // hash the password
    bcrypt.hash(password, null, null, function (err, hash) {
        if (err)
            return next(err);
        user.local.password = hash;
    });

};

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('User', userSchema);
