var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var trainerSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String},
    email: {type: String, required: true, unique: true},
    routines: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'routineSchema'
    },
    clients: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userSchema'
    }
});


trainerSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('trainerModel', trainerSchema);
