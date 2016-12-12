var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var routineSchema = new Schema({
    title: {type: String},
    description: {type: String},
    startingDay: {type: Date},
    discipline: {type: String},
    price: { type: String },//si és gratis, es posa q val 0, així els users ho veuen amb bons ulls
    image: { type: String },
    client: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trainerModel'
    },
    days: [{
        title: {type: String},
        description: {type: String},
        exercises: [{
            name: {type: String},
            description: {type: String},
            img: {type: String},
            weight: {type: String},
            distance: {type: String},
            reps: {type: String},
            series: {type: String}
        }],
        done: {type: String}//si ha complert el dia
    }]
})
;
routineSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('routineModel', routineSchema);
