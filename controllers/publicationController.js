var express = require('express');
var app = express();
var publicationModel = require('../models/publicationModel');
var userModel = require('../models/userModel');
//var trainerModel = require('../models/trainerModel');
var crypto = require('crypto');

/**GET '/publications' **/
exports.getAllPublications = function (req, res) {
    publicationModel.find()
    .limit(Number(req.query.pageSize))
    .skip(Number(req.query.pageSize)*Number(req.query.page))
    .lean()
    .populate('user', 'name avatar')
    .exec(function (err, publications) {
        if (err) return res.send(500, err.message);
        if (!publications) {
            //
        } else if (publications) {
            res.status(200).jsonp(publications);
        }
    });
};

/**POST '/publications' **/
exports.postPublication = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'user not found.'});
        } else if (user) {
            //aquí ja hem agafat el user a partir del seu token
            var publication = new publicationModel({
                title: req.body.title,
                content: req.body.content,
                date: new Date(),
                user: user._id,
                photo: req.body.photo
            });
            //fins aquí tenim la variable publication amb els continguts
            //ara cal 1r guardar el model publication a la base de dades
            publication.save(function (err, publication) {
                if (err) return res.send(500, err.message);

                //i 2n, afegir la id de la publicació generada al user.publications
                user.publications.push(publication._id);
                /* gamification */
                var reward = {
                    concept: "added new publication to Timeline",
                    date: Date(),
                    value: +1
                };
                user.points.history.push(reward);
                user.points.total = user.points.total + 1;
                /* end of gamification */
                user.save(function (err, user) {
                    if (err) return res.send(500, err.message);
                    res.status(200).jsonp(user);
                });
            });
        }//end else if
    });
};

/**GET '/users/:userid/publications' **/
exports.getUserPublicationsByUserId = function (req, res) {
    userModel.findOne({_id: req.params.userid}, function (err, user) {
        if (err) return res.send(500, err.message);
    }).populate('publications')
        .exec(function (error, user) {
            if (error !== null) res.send(500, error.message);
            console.log(JSON.stringify(user, null, "\t"));
            res.status(200).jsonp(user.publications);
        });
};

/**DELETE '/publications/:publicationid' **/
exports.deletePublicationById = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'user not found.'});
        } else if (user) {
            for (var i = 0; i < user.publications.length; i++) {
                if (user.publications[i].equals(req.params.publicationid)) {//només si el user és qui ha fet la publication la pot esborrar
                    user.publications.splice(i, 1);
                    user.save(function (err, user) {//guardem l'user
                        if (err) return res.send(500, err.message);

                        publicationModel.findByIdAndRemove({_id: req.params.publicationid}, function (err) {
                            if (err !== null) return res.send(500, err.message);
                            res.status(200).jsonp('Deleted');
                        });
                    });
                }
            }
        }
    });
};

/** POST '/publications/:publicationid/like' **/
exports.likePublication = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'user not found.'});
        } else if (user) {
            console.log(user.name);
            //ara busquem el userB
            publicationModel.findOne({_id: req.params.publicationid}, function (err, publication) {
                if (err) return res.send(500, err.message);
                if (!publication) {
                    res.json({success: false, message: 'publication not found.'});
                } else if (publication) {

                    //          for(var i=0; i<userB.timeline)
                    publication.likes.push(user._id);
                    publication.save(function (err, publication) {
                        if (err) return res.send(500, err.message);

                        /* gamification */
                        var reward = {
                            concept: "liked publication " + publication.title,
                            date: Date(),
                            value: +1
                        };
                        user.points.history.push(reward);
                        user.points.total = user.points.total + 1;
                        /* end of gamification */
                        user.save(function (err, user) {
                            if (err) return res.send(500, err.message);
                            //ara busquem el user que ha fet la publication que ha rebut el like
                            userModel.findOne({_id: publication.user})
                            .exec(function (err, userB) {
                                /*notification*/
                                var notification = {
                                    state: "pendent",
                                    message: "user clicked like",
                                    link: "user/"+userB._id,
                                    icon: "newlike.png",
                                    date: Date()
                                };
                                userB.notifications.push(notification);
                                /* end of notification*/
                                userB.save(function (err, user) {
                                    if (err) return res.send(500, err.message);
                                    publicationModel.findOne({_id: req.params.publicationid})
                                    .lean()
                                    .populate('user', 'name avatar')
                                    .exec(function (err, publication) {
                                        if (err) return res.send(500, err.message);
                                        if (!publication) {
                                            //
                                        } else if (publication) {
                                            res.status(200).jsonp(publication);
                                        }
                                    });
                                });
                            });

                        });

                    });
                }//end else if
            });
        }//end else if
    });
};

/** POST '/publications/:publicationid/dislike' **/
exports.dislikePublication = function (req, res) {
    userModel.findOne({'tokens.token': req.headers['x-access-token']}, function (err, user) {
        if (err) return res.send(500, err.message);
        if (!user) {
            res.json({success: false, message: 'user not found.'});
        } else if (user) {
            console.log(user.name);
            //ara busquem el userB
            publicationModel.findOne({_id: req.params.publicationid}, function (err, publication) {
                if (err) return res.send(500, err.message);
                if (!publication) {
                    res.json({success: false, message: 'publication not found.'});
                } else if (publication) {

                    for (var i = 0; i < publication.likes.length; i++) {
                        if (publication.likes[i].equals(user._id)) {
                            publication.likes.splice(i, 1);
                        }
                    }
                    publication.save(function (err, publication) {
                        if (err) return res.send(500, err.message);

                        /* gamification */
                        var reward = {
                            concept: "disliked publication " + publication.title,
                            date: Date(),
                            value: -1
                        };
                        user.points.history.push(reward);
                        user.points.total = user.points.total - 1;
                        /* end of gamification */
                        user.save(function (err, user) {
                            if (err) return res.send(500, err.message);

                            publicationModel.findOne({_id: req.params.publicationid})
                                .lean()
                                .populate('user', 'name avatar')
                                .exec(function (err, publication) {
                                    if (err) return res.send(500, err.message);
                                    if (!publication) {
                                        //
                                    } else if (publication) {
                                        res.status(200).jsonp(publication);
                                    }
                                });
                        });
                    });
                }//end else if
            });
        }//end else if
    });
};

/** GET '/publications/newsfeed' **/
var ObjectId = require('mongodb').ObjectID;
exports.getNewsFeed = function (req, res) {//getPublicationsFromFollowingUsers
    //primer agafem l'user que fa la petició, per saber quins users està seguint
    var newsfeed = [];
    userModel.findOne({'tokens.token': req.headers['x-access-token']})
        .exec(function (err, user) {
            if (err) return res.send(500, err.message);
            if (!user) {
                res.json({success: false, message: 'getting newsfeed failed. user not found.'});
            } else if (user) {
                console.log("getting newsfeed for user: " + user.name);

                var following = [];
                for (var i = 0; i < user.following.length; i++) {//això ho fem perquè necessitem la array amb el contingut en format objectid
                    following.push(new ObjectId(user.following[i]));
                }
                following.push(new ObjectId(user._id));//així també reb les seves pròpies publicacions

                publicationModel.find({user: {$in: following}})
                    .lean()
                    .populate('user', 'name avatar')
                    .exec(function (err, publications) {
                        if (err) return res.send(500, err.message);
                        if (!publications) {
                            //
                        } else if (publications) {
                            res.status(200).jsonp(publications);
                        }
                    });
            }
        });
};
