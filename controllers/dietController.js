var express = require('express');
var app = express();
var config = require('../config/config'); // get our config file
var crypto = require('crypto');

app.set('superSecret', config.secret); // secret variable


var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');
var chefModel = require('../models/chefModel');

exports.getDiets = function (req, res) {
    dietModel.find(function (err, diets) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(diets);
    });
};
/** GET Diet by diet._id**/
//  get /diets/:id
exports.getDietById = function (req, res) {
    dietModel.findOne({_id: req.params.dietid}, function (err, diet) {
        if (err) res.send(500, err.message);
        res.status(200).jsonp(diet);
    });
};


/**POST add new diet to DB**/

exports.createDiet = function (req, res) {
  chefModel.findOne({'token': req.headers['x-access-token']}, function (err, chef) {
    if (err) res.send(500, err.message);
    if (!chef) {
        res.json({success: false, message: 'Diet creation failed. Chef not found.'});
    }else if(chef){
      var diet = new dietModel({
          title: req.body.title,
          description: req.body.description,
          chef: chef._id,//a partir del token, pillem la id
          client: req.params.clientid//es guarda de quin user és la diet
      });
      //guardem la diet
      diet.save(function (err, diet) {
          if (err) {
              console.log(err.message);
              return res.status(500).send(err.message);
          }
          //ara guardem la dietid al chef
          chef.diets.push(diet._id);
          chef.save(function(err, chef){
            if (err) res.send(500, err.message);

          });
          res.status(200).jsonp(diet);
      });
    }//else
  });
};

// add day
exports.addDayToDiet = function (req, res) {
  chefModel.findOne({'token': req.headers['x-access-token']}, function (err, chef) {
    if (err) res.send(500, err.message);
    if(!chef) {
        res.json({success: false, message: 'Diet day addition failed. Trainer not found.'});
    }else if(chef){
      dietModel.findOne({_id: req.params.dietid}, function (err, diet) {
          if (err) res.send(500, err.message);

          if(chef._id.equals(diet.chef))
          {// si el chef que fa el post realment és el chef creator de la diet
            diet.days.push(req.body.day);
            diet.save(function (err, diet) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.status(200).jsonp(diet);
            });
          }
      });
    }// end else if
  });
};


/** DELETE diet by diet._id**/
//  /diets/:id
exports.deleteDietById = function (req, res) {
    dietModel.findByIdAndRemove({_id: req.params.dietid}, function (err) {
        if (err) res.send(500, err.message);
        res.status(200).send("Deleted");
    });
};






exports.chooseDiet = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'choosing diet failed. user not found.'});
        }else if(user){
          user.diets.push(req.body.dietid);
          /* gamification */
          var reward={
            concept: "choosing diet",
            date: Date(),
            value: +5
          };
          user.points.history.push(reward);
          user.points.total=user.points.total+5;
          /* end of gamification */
          user.save(function (err) {
              if (err) res.send(500, err.message);

              res.status(200).jsonp(user);
          })
        }//end else if
    });
};
exports.unchooseDiet = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'user not found.'});
        }else if(user){
          for(var i=0; i<user.diets.length; i++)
          {
            if(user.diets[i]==req.body.dietid)
            {//deletes the diets of the user with the dietid
              user.diets.splice(i, 1);
            }
          }
          /* gamification */
          var reward={
            concept: "unchoosing diet",
            date: Date(),
            value: -7
          };
          user.points.history.push(reward);
          user.points.total=user.points.total-7;
          /* end of gamification */
          user.save(function (err) {
              if (err) res.send(500, err.message);

              res.status(200).jsonp(user);
          });
        }//end else if
    });
};

exports.completeDay = function (req, res) {
    userModel.findOne({'token': req.headers['x-access-token']}, function (err, user) {
        if (err) res.send(500, err.message);
        if(!user) {
            res.json({success: false, message: 'user not found.'});
        }else if(user){
          /* gamification */
          var reward={
            concept: "diet day complete",
            date: Date(),
            value: +1
          };
          user.points.history.push(reward);
          user.points.total=user.points.total+1;
          /* end of gamification */
          user.save(function (err) {
              if (err) res.send(500, err.message);

              res.status(200).jsonp(user);
          });
        }//end else if
    });
};
