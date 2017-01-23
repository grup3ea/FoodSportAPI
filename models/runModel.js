var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var runSchema = new Schema({
    title: {type: String},
    photo: {type: String},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    datestart: {type: Date},
    datefinish: {type: Date},
    distance: {type: Number},
    positions: [{
        date: {type: Date},
        lat: {type: Number},
        long: {type: Number},
        distance: {type: Number}
    }]
});

runSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('runModel', runSchema);
