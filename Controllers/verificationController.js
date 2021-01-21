let mongodb = require('mongodb');
const database = require('../database');
const email = require('../modules/email');

let mongoose = require('mongoose');
const db = mongoose.connection;
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://akash:1234@nodetuts.wxb9o.mongodb.net/StudentRequestSystem?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

module.exports.verifyId_get = (req, res) => {
    let s_id = req.params.id;
    let o_id = new mongodb.ObjectID(s_id)
    database.updateOne('users', {_id: o_id }, {verified: true});
    res.render('verified');
};

module.exports.verifyEmail_get = (req, res) => {
    let id = req.params.id;
    db.collection('users').findOne({_id: mongoose.Types.ObjectId(id)}).then(profile => {
        res.render('verify', {email, id});
    });
    
};

module.exports.sendEmailAgain_get = (req, res) => {
    let id = req.params.id;
    
    db.collection('users').findOne({_id: mongoose.Types.ObjectId(id)}).then(result => {
        email(result.email, 'signup', {id:id});
        res.redirect('/verifyemail/' + id);
    });
};