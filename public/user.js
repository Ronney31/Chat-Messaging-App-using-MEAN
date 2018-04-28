
/* Data base*/
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/database')
// var uniqueValidator = require('mongoose-unique-validator');
// var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email:  {
        type: String,
        required: true, 
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        index: true
    },  
    friends: [String]
});

var User = mongoose.model('User', UserSchema);
// make this available to our users in our Node applications
module.exports = User;


/*
UserSchema.methods.setPassword = function(password){
this.salt = crypto.randomBytes(16).toString('hex');
this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
*/
