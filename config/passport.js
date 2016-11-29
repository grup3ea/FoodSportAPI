var mongoose = require('mongoose');
var User= mongoose.model('User');

var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy= require('passport-facebook').Strategy;

var configPassport = require('./configPassport');

module.exports = function(passport){
  passport.serializeUser(function(user, done){
    done(null, user);
  });
  passport.deserializeUser(function(obj, done){
    done(null, obj);
  });

  // Configuración del autenticado con Twitter
  passport.use(new TwitterStrategy({
		consumerKey		 : configPassport.twitter.key,
		consumerSecret	: configPassport.twitter.secret,
		callbackURL		 : '/auth/twitter/callback'
	}, function(accessToken, refreshToken, profile, done) {
		// Busca en la base de datos si el usuario ya se autenticó en otro
		// momento y ya está almacenado en ella
		User.findOne({provider_id: profile.id}, function(err, user) {
			if(err) throw(err);
			// Si existe en la Base de Datos, lo devuelve
			if(!err && user!== null) return done(null, user);

			// Si no existe crea un nuevo objecto usuario
			user = new User({
				provider_id	: profile.id,
				provider		 : profile.provider,
				name				 : profile.displayName,
				photo				: profile.photos[0].value
			});
			//...y lo almacena en la base de datos
			user.save(function(err) {
				if(err) throw err;
				done(null, user);
			});
		});
  }));

  // Configuración del autenticado con Facebook

};
