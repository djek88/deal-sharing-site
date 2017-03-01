const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const initRoutes = require('./app/routes.js');
const configDB = require('./config/database.js');
const port = process.env.PORT || 5000;

let app = express();

mongoose.Promise = global.Promise;
mongoose.connect(configDB.url);
require('./config/passport.js')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('./lib/express-session'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine', 'ejs');

initRoutes(app, passport);

app.listen(port);
console.log('The magic happens on port ' + port);