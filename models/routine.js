var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var routineSchema = new Schema({
    title: {type: String},
    description: {type: String},
    days: [{
        title: {type: String},
        exercises: [{
            name: {type: String},
            description: {type: String},
            img: {type: String},
            weight: {type: String},
            distance: {type: String},
            reps: {type: String},
            series: {type: String}
        }]
    }]
});

userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Routine', routineSchema);
