var qs   = require('querystring');
var path = require('path');


var jwt  = require('jsonwebtoken');
var secret = process.env.JWT_SECRET || "CHANGE_THIS_TO_SOMETHING_RANDOM"; // super secret

// show fail page (login)
function authFail(res, callback) {
    res.writeHead(401, {'content-type': 'text/html'});
    return res.end(fail);
}

// generate a GUID
function generateGUID() {
    return new Date().getTime(); // we can do better with crypto
}

// create JWT
function generateToken(req, GUID, opts) {
    opts = opts || {};

    // By default, expire the token after 7 days.
    // NOTE: the value for 'exp' needs to be in seconds since
    // the epoch as per the spec!
    var expiresDefault = Math.floor(new Date().getTime()/1000) + 7*24*60*60;

    var token = jwt.sign({
        auth:  GUID,
        agent: req.headers['user-agent'],
        exp:   opts.expires || expiresDefault
    }, secret);
    return token;
}

function generateAndStoreToken(req, opts) {
    var GUID   = generateGUID(); // write/use a better GUID generator in practice
    var token  = generateToken(req, GUID, opts);
    var record = {
        "valid" : true,
        "created" : new Date().getTime()
    };

    db.put(GUID, JSON.stringify(record), function (err) {
        // console.log("record saved ", record);
    });

    return token;
}

function authSuccess(req, res) {
    var token = generateAndStoreToken(req);

    res.writeHead(200, {
        'content-type': 'text/html',
        'authorization': token
    });
    return res.end(restricted);
}

// lookup person in "database"
var u = { un: 'masterbuilder', pw: 'itsnosecret' };

// handle authorisation requests
function authHandler(req, res){
    if (req.method === 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        }).on('end', function () {
            var post = qs.parse(body);
            if(post.username && post.username === u.un && post.password && post.password === u.pw) {
                return authSuccess(req, res);
            } else {
                return authFail(res);
            }
        });
    } else {
        return authFail(res);
    }
}

function verify(token) {
    var decoded = false;
    try {
        decoded = jwt.verify(token, secret);
    } catch (e) {
        decoded = false; // still false
    }
    return decoded;
}

// can't use the word private as its an ES "future" reserved word!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords
function privado(res, token) {
    res.writeHead(200, {
        'content-type': 'text/html',
        'authorization': token
    });
    return res.end(restricted);
}

function validate(req, res, callback) {
    var token = req.headers.authorization;
    var decoded = verify(token);
    if(!decoded || !decoded.auth) {
        authFail(res);
        return callback(res);

    } else {
        // check if a key exists, else import word list:
        db.get(decoded.auth, function (err, record) {
            var r;
            try {
                r = JSON.parse(record);
            } catch (e) {
                r = { valid : false };
            }
            if (err || !r.valid) {
                authFail(res);
                return callback(res);
            } else {
                privado(res, token);
                return callback(res);
            }
        });
    }
}

function exit(res) {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.end('bye');
    process.exit(); // kill the server!
}

function notFound(res) {
    res.writeHead(404, {'content-type': 'text/plain'});
    return res.end('Not Found');
}

function home(res) {
    res.writeHead(200, {'content-type': 'text/html'});
    return res.end(index);
}

function done(res) {
    return; // does nothing. (pass as callback)
}

module.exports = {
    fail : authFail,
    exit: exit,
    done: done, // moch callback
    home: home,
    handler : authHandler,
    notFound : notFound,
    success : authSuccess,
    validate : validate,
    verify : verify,
    generateAndStoreToken: generateAndStoreToken
}