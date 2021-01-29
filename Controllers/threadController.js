const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Thread = require('../models/Thread');
const database = require('../database');
const mail = require('../modules/email');

let mongoose = require('mongoose');
const db = mongoose.connection;
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://akash:1234@nodetuts.wxb9o.mongodb.net/StudentRequestSystem?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({id}, 'esghsierhgoisio43jh5294utjgft*/*/4t*4et490wujt4*/w4t*/t4', {
        expiresIn: maxAge
    });
};

module.exports.submitRequests_post = (req, res) => {
    let data = req.body;

    const token = req.cookies.jwt;

    jwt.verify(token, 'esghsierhgoisio43jh5294utjgft*/*/4t*4et490wujt4*/w4t*/t4', (err, decodedToken) => {
        let id = decodedToken.id;

        db.collection('users').findOne({_id: mongoose.Types.ObjectId(id)}).then(user => {

            let messageId = database.addMessage({
                "from": user._id,
                "text": data.message,
            });

            let additionalData = {}

            if(data.requiredModule != null){
                additionalData.requiredModule = data.requiredModule;
            }

            database.addThread({
                 "studentID": id,
                 "type": data.type,
                 "messageID_list": [messageId],
                 "topic": data.topic,
                 "StaffID": data.lecturer,
                 "type": data.type,
                 "status": 'active',
                 "additionalData": additionalData,
                 "module": data.module
            });

            console.log(data.currentModule);
        });
    });

    res.redirect('/userprofile');
};

module.exports.getThreadData_get = (req, res) => {

    const token = req.cookies.jwt;

    jwt.verify(token, 'esghsierhgoisio43jh5294utjgft*/*/4t*4et490wujt4*/w4t*/t4', (err, decodedToken) => {
        let id = decodedToken.id;

        db.collection('users').findOne({_id: mongoose.Types.ObjectId(id)}).then(user => {
            
            db.collection('threads').find({"studentID": id}).toArray().then(array => {
                let name = user.name;

                array.forEach(element => {
                    element.name = name;
                })
                res.json(array);
            });

        });
    });
};

module.exports.getMessages_post = (req, res) => {

    let threadId = req.body.threadId;

    let getData = async () => {

        let thread = await db.collection('threads').findOne({_id: mongoose.Types.ObjectId(threadId)});

        let messageIdList = thread.messageID_list;
        
            messages = []

            messageIdList.forEach((element) => {
                
                
            });

            for(let i = 0; i < messageIdList.length; i++){
                let message = await db.collection('messages').findOne({_id: mongoose.Types.ObjectId(messageIdList[i])});
                messages.push(message);
            }

            res.json({messages});
    
    };
    getData();

    

};

module.exports.reply_post = (req, res) => {

    const token = req.cookies.jwt;

    jwt.verify(token, 'esghsierhgoisio43jh5294utjgft*/*/4t*4et490wujt4*/w4t*/t4', (err, decodedToken) => {
        let id = decodedToken.id;

        db.collection('users').findOne({_id: mongoose.Types.ObjectId(id)}).then(user => {
            
            let messageId = database.addMessage({
                "from": id,
                "text": req.body.text,
            });

            db.collection('threads').updateOne({_id: mongoose.Types.ObjectId(req.body.threadId)}, {$push: {messageID_list: messageId.toString()}});

        });
    });
    
};

module.exports.acceptOrDeclineRequest_post = (req, res) => {
    data = req.body;
    console.log(data);

    database.updateOne('threads', {_id: mongoose.Types.ObjectId(data.threadId)}, {status: data.status});

    res.json({'status': 'success'});
};