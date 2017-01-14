var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var conversationSchema = new Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    messages: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel'
        },
        content: {type: String},
        date: {type: Date}
    }],
    modifiedDate: {type: Date}
});

conversationSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('conversationModel', conversationSchema);
