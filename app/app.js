// Set up app
var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var util = require('util');

// Time
var moment = require('moment');
moment().format();

var app = express();
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));

// My DB config
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/escape');
mongoose.Promise = require('bluebird');

// My schema
var roomSchema = new Schema({
    name: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
var Room = mongoose.model('Room', roomSchema, 'rooms');

// Define locals
app.locals.toProperCase = function(s) {
    return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
};

// Set template engine to pug
app.set('view engine', 'pug');

// My home page
app.get('/', function(req, res) {
    res.render('index');
});

// My welcome page
app.get('/hello/:username', function(req, res) {
    req.check('username', 'Error: Invalid Username').notEmpty().isAlpha();
    var errors = req.validationErrors();
    if (errors) {
        console.log(util.inspect(errors));
        return res.redirect('/');
    }

    return res.render('index', {
        name: req.params.username
    });
});

// View all available rooms
app.get('/rooms', function(req, res) {
    return Room.find({}, function(err, data) {
        if (err) console.log(err);
        return res.render('all-rooms', {
            rooms: data
        });
    });
});

// Add a room
app.get('/rooms/add/:roomName', function(req, res) {
    req.check('roomName', 'Error: Invalid Room Name').notEmpty().isAlpha();
    var errors = req.validationErrors();
    if (errors) {
        console.log(util.inspect(errors));
        return res.redirect('/rooms');
    }

    var newRoom = new Room({
        name: req.params.roomName
    });

    return newRoom.save(function(err, data) {
        if (err) {
            console.log(err);
            return res.send('Error' + err);
        }
        return res.redirect('/rooms/' + newRoom.name);
    });
});

// View a room
app.get('/rooms/:roomName', function(req, res) {
    req.check('roomName', 'Error: Invalid Room Name').notEmpty().isAlpha();

    var errors = req.validationErrors();
    if (errors) {
        console.log(util.inspect(errors));
        return res.redirect('/rooms');
    }

    return Room.findOne({
        name: req.params.roomName
    }, function(err, data) {
        console.log(data);
        if (err || !data) {
            console.log(err);
            return res.redirect('/rooms');
        }
        return res.render('room', {
            name: data.name,
            timestamp: moment(data.timestamp).fromNow()
        });
    });
});

// Run app
const port = 3000;
app.listen(port, function () {
    console.log('Running on localhost:' + port);
});










