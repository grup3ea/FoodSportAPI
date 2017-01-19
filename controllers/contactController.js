var express = require('express');
var app = express();
var config = require('../config/config');
/*******MODELS*********/
var contactModel = require('../models/contactModel');

/** GET '/contacts/' **/
exports.getContacts = function (req, res) {
    contactModel.find()
        .limit(Number(req.query.pageSize))
        .skip(Number(req.query.pageSize) * Number(req.query.page))
        .exec(function (err, contacts) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(contacts);
        });
};

/** GET '/contacts/:contactsid' **/
exports.getContactById = function (req, res) {
        contactModel.findOne({_id: req.params.contactid})
            .exec(function (err, contact) {
                if (err) return res.send(500, err.message);
                res.status(200).jsonp(contact);
            });
};

/**POST '/contact' **/
exports.createContact = function (req, res) {
    var contact = new contactModel({
        name: req.body.name,
        subject: req.body.subject,
        email: req.body.email,
        description: req.body.description
    });
    contact.save(function (err, contact) {
        if (err) {
            console.log(err.message);
            return res.status(500).send(err.message);
        }
        res.status(200).jsonp(contact);
    });
};
