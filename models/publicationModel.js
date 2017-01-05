var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var publicationSchema = new Schema({
    title: {type: String, required: true, unique: true},
    content: {type: String, required: true},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    photo: {type: String},//link a la imatge, en plan, l'user corrent pel carrer tot feliç
    date: {type: Date},
    likes: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }]
});

publicationSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('publicationModel', publicationSchema);
