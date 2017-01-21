module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'google' : {
        'clientID'      : '1091227879951-1epi3vuvt0h0lg9v84m66hun92dkjqhi.apps.googleusercontent.com',
        'clientSecret'  : 'Bqnrvu1GgQvtBLO7ewCLLI9n',
        'callbackURL'   : 'http://localhost:3005/api/auth/google/callback'
    }

};
