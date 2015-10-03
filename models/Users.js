var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    fbid: { type: String, index: { unique: true }},
    schedule: [{
        course: {}, 
        section: {}, 
        color: String
    }]
});

mongoose.model('User', UserSchema);
