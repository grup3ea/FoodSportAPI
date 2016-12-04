var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var routineSchema = new Schema({
    title: {type: String},
    description: {type: String},
    discipline: {type: String},
    client: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainerModel'
    },
    week: [{
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
    }]
});

routineSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('routineModel', routineSchema);
