var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var crypto = require('crypto');

app.set('superSecret', config.secret);

/*******MODELS*********/
//var trainerModel = require('../models/trainerModel');
var userModel = require('../models/userModel');
var dietModel = require('../models/dietModel');
var routineModel = require('../models/routineModel');

/** GET '/admin/users/' **/
exports.getUsers = function (req, res) {
    userModel.find()
        .limit(Number(req.query.pageSize))
        .skip(Number(req.query.pageSize) * Number(req.query.page))
        .exec(function (err, users) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(users);
        });
};
/** GET '/admin/users/:userid' **/
exports.getUserById = function (req, res) {
    userModel.findOne({_id: req.params.userid})
        .lean()
        .populate('followers', 'name avatar')
        .populate('following', 'name avatar')
        .exec(function (err, user) {
            if (err) return res.send(500, err.message);
            if (!user) {
                res.json({success: false, message: 'User not found.'});
            } else if (user) {
                var nodes=[];
                var edges=[];
                var node={
                    title: user.name,
                    label: user.name,
                    image: user.avatar,
                    shape: "image",
                    id: user._id
                };
                nodes.push(node);
                for(var i=0; i<user.followers.length; i++)
                {
                    var node={
                        title: user.followers[i].name,
                        label: user.followers[i].name,
                        image: user.followers[i].avatar,
                        shape: "image",
                        id: user.followers[i]._id
                    };
                    nodes.push(node);
                    var edge={
                        from: user._id,
                        to: user.followers[i]._id,
                        arrows: {
                            from: user._id
                        },
                        color: {
                            color: "#36bc9b"
                        }
                    };
                    edges.push(edge);
                }

                for(var i=0; i<user.following.length; i++)
                {
                    var indexJ=-1
                    for(var j=0; j<nodes.length; j++)
                    {
                        if(nodes[j].id.equals(user.following[i]._id))
                        {
                            indexJ=JSON.parse(JSON.stringify(j));
                        }
                    }
                    if(indexJ==-1)
                    {//el node no estava als followers, afegim el node
                        var node={
                            title: user.following[i].name,
                            label: user.following[i].name,
                            image: user.following[i].avatar,
                            shape: "image",
                            id: user.following[i]._id
                        };
                        nodes.push(node);
                    }
                    var edge={
                        from: user._id,
                        to: user.following[i]._id,
                        arrows: {
                            to: user.following[i]._id
                        },
                        color: {
                            color: "#4876b4"
                        }
                    };
                    edges.push(edge);
                }

                res.status(200).jsonp({
                    nodes: nodes,
                    edges: edges
                });
            }
        });
};
