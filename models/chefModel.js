var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var chefSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String},
    email: {type: String, required: true, unique: true},
    direction: {type: String},
    city: {type: String},
    diets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dietModel'
    }]
});


chefSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('chefModel', chefSchema);