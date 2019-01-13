const mongoose = require('mongoose');

const mongoDB = process.env.mongoURL;
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', function(err){
    global.connected = false;
});

db.on('connected', function () {
    console.log('Connected to database');
    global.connected = true;;
});

module.exports = db;