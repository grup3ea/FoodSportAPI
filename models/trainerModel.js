var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var trainerSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String},
    email: {type: String, required: true, unique: true},
    description: {type: String},
    discipline : {type:String},
    description: {type:String},
    routines: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'routineModel'
    }],
    clients: [{
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
      },
      petitionMessage: {type: String},
      date: {type: Date}
  }],
    clientsPetitions: [{
      clientid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'userModel'
      },
      message: {type: String},
      state: {type: String}//pendent, accepted, declined
    }]
});


trainerSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('trainerModel', trainerSchema);
