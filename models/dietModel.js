var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var dietSchema = new Schema({
    title: {type: String},
    description: {type: String},
    initiationdate: {type: Date},
    week: [{
        title: {type: String},
        description: {type: String},
        days: [{
            title: {type: String},
            meals: [{
                title: {type: String},
                submeal: [{
                    title: {type: String},
                    description: {type: String},
                    amount: {
                        unit: {type: String},
                        quantity: {type: String}
                    },
                    nutritional: {
                        kcal: {type: String},
                        proteins: {type: String},
                        carbohidrates: {type: String},
                        fats: {type: String},
                        vitamins: {type: String}
                    }
                }]
            }]
        }]
    }]
});
dietSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('dietModel', dietSchema);
