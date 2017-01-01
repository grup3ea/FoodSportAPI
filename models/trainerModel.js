var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var trainerSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    //token: {type: String},
    tokens: [{
      userAgent: {type: String},
      token: {type: String}
    }],
    email: {type: String, required: true, unique: true},
    description: {type: String},
    disciplines : [{type:String}],
    avatar: {type: String},
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
    }],
    notifications: [{
      state: {type: String},//viewed, pendent
      message: {type: String},
      link: {type: String},
      icon: {type: String},
      date: {type: Date},
      dateviewed: {type: Date}
    }],
    valorations: [{
      clientid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'userModel'
      },
      date: {type: Date},
      message: {type: String},//missatge de valoració
      value: {type: Number}//per exemple sistema d'estrelles sobre 5
    }]
});


trainerSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('trainerModel', trainerSchema);
