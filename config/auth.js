module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'YzXeDLbtzWe8bya5UNPYJNR3G',
        'consumerSecret'    : 'VMmYoIZ5jWehgMc8PziJOJEnNArwnrA8rFLwcuzbfzwwoOyN3k',
        'callbackURL'       : 'http://localhost:3005/api/auth/twitter/callback'
    },

    'google' : {
        'clientID'      : '1091227879951-1epi3vuvt0h0lg9v84m66hun92dkjqhi.apps.googleusercontent.com',
        'clientSecret'  : 'Bqnrvu1GgQvtBLO7ewCLLI9n',
        'callbackURL'   : 'http://localhost:3005/api/auth/google/callback'
    }

};
