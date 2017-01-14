var express = require('express');
var app = express();
var conversationModel = require('../models/conversationModel');
var userModel = require('../models/userModel');
//var trainerModel = require('../models/trainerModel');
var crypto = require('crypto');

exports.getUserConversations = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']})
        .lean()
        .populate('conversations')
        .exec(function (err, user) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(user.conversations);
        });
};

/**POST '/conversations' **/
exports.createConversation = function (req, res) {//req.body.userB
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, userA) {
        if (err) return res.send(500, err.message);
        if (!userA) {
            res.json({success: false, message: 'userA not found.'});
        } else if (userA) {
            //aquí ja hem agafat el userA a partir del seu token
            userModel.findOne({_id: req.body.userB}, function (err, userB) {//busquem l'userB
                if (err) return res.send(500, err.message);
                if (!userB) {
                    res.json({success: false, message: 'userB not found.'});
                } else if (userB) {
                    var conversation = new conversationModel({
                        userA: userA._id,
                        userB: userB._id,
                        modifiedDate: Date()
                    });
                    conversation.save(function (err, conversation) {
                        if (err) return res.send(500, err.message);

                        userA.conversations.push(conversation._id);
                        userA.save(function (err) {
                            if (err) return res.send(500, err.message);
                            userB.conversations.push(conversation._id);
                            userB.save(function (err) {
                                if (err) return res.send(500, err.message);
                                userModel.findOne({'tokens.token': req.headers['x-access-token']})
                                    .lean()
                                    .populate('conversations')
                                    .exec(function (err, user) {
                                        if (err) return res.send(500, err.message);
                                        res.status(200).jsonp(user.conversations);
                                    });
                            });
                        });
                    });
                }//end else if (userB)
            });//end of userB find
        }//end else if (userA)
    });//end of userA find
};


/**POST '/conversations/:conversationid' **/
exports.addMessageToConversation = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, userSender) {
        if (err) return res.send(500, err.message);
        if (!userSender) {
            res.json({success: false, message: 'userSender not found.'});
        } else if (userSender) {
            //aquí ja hem agafat el userSender a partir del seu token
            conversationModel.findOne({_id: req.params.conversationid}, function (err, conversation) {
                if (err) return res.send(500, err.message);
                if (!conversation) {
                    res.json({success: false, message: 'conversation not found.'});
                } else if (conversation) {
                    var newmessage = {
                        user: userSender._id,
                        content: req.body.message,
                        date: Date()
                    };
                    conversation.messages.push(newmessage);
                    conversation.modifiedDate=Date();

                    conversation.save(function (err, conversation) {
                        if (err) return res.send(500, err.message);

                        //ara cal saber qui és l'userReciever (el que no ha enviat el missatge)
                        var idUserReciever;
                        if(userSender._id.equals(conversation.userA)==false){
                            idUserReciever=conversation.userA;
                        }else if(userSender._id.equals(conversation.userB)==false){
                            idUserReciever=conversation.userB;
                        }
                        userModel.findOne({_id: idUserReciever}, function (err, userReciever) {//busquem l'userReciever
                            if (err) return res.send(500, err.message);
                            if (!userReciever) {
                                res.json({success: false, message: 'userReciever not found.'});
                            } else if (userReciever) {
                                console.log("reciever: " + userReciever.name);
                                /*notification*/
                                var notification = {
                                    state: "pendent",
                                    message: userSender.name + " sent a message to you",
                                    link: "messages",
                                    icon: "message.png",
                                    date: Date()
                                };
                                userReciever.notifications.push(notification);
                                /* end of notification*/
                                userReciever.save(function (err) {
                                    if (err) return res.send(500, err.message);
                                    userModel.findOne({'tokens.token': req.headers['x-access-token']})
                                        .lean()
                                        .populate('conversations')
                                        .exec(function (err, user) {
                                            if (err) return res.send(500, err.message);
                                            res.status(200).jsonp(user.conversations);
                                        });
                                });
                            }//end else if (userReciever)
                        });//end userReciever find
                    });
                }//end else if (conversation)
            });//end of conversation find
        }//end else if (userSender)
    });//end of userSender find
};
