var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var publicationSchema = new Schema({
    title: {type: String, required: true, unique: true},
    content: {type: String, required: true},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema'
    },
    created: {type: Date}
});

publicationSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Publication', publicationSchema);

