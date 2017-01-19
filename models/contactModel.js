var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    name: {type: String, required: true, unique: true},
    subject: {type: String, required: true, select: false},
    email: {type: String, required: true, unique: true},
    description: {type: String}
});
contactSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('contactModel', contactSchema);
