var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var dietSchema = new Schema({
    title: {type: String},
    description: {type: String},
    startingDay: {type: Date},
    price: { type: Number },
    image: { type: String },
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel'
    },
    days: [{
        date: {type: Date}, //Ha de ser realmente un día que empiezas por ejemplo 12/12/2016 para poder ir completando según la fecha, comer comes cada día
        name: {type:Date},
        description: {type: String},
        meals: [{
            title: {type: String},
            img: {type: String},
            submeals: [{
                title: {type: String},
                description: {type: String},
                amount: {
                    unit: {type: String},
                    quantity: {type: Number}
                },
                nutritional: {
                    kcal: {type: Number},
                    proteins: {type: Number},
                    carbohidrates: {type: Number},
                    fats: {type: Number},
                    vitamins: {type: Number}
                }
            }]
        }],
        done: {type: Boolean, default: false}
    }]
});
dietSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('dietModel', dietSchema);
