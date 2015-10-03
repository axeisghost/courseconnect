var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require('./../models/Users');
var User = mongoose.model('User');

router.get('/:id', function(req, res, next) {
    User.findOne({fbid: req.params.id}, function(err, user){
        if(err){ return next(err); }
        res.json(user);
    });
});

router.post('/:id', function(req, res, next) {
    User.findOne({fbid: req.params.id}, function(err, user){
        if(err){ return next(err); }
        if (!user) {
            var newUser = new User({fbid: req.params.id, schedule: []});
            newUser.save();
        }
    });
});

router.put('/:id', function(req, res, next) {
    console.log('update received');
    User.update({fbid: req.params.id}, {schedule: req.body}, {}, function(err, user){
        if(err){ return next(err); }
        res.send('update complete');
    });
});

module.exports = router;
