const express = require('express');
const cluster = require('cluster');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const initRoutes = require('./app/routes.js');
const configDB = require('./config/database.js');
const port = process.env.PORT || 5000;

var app = express();

mongoose.connect(configDB.url);
require('./config/passport.js')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine', 'ejs');

initRoutes(app, passport);

app.listen(port);
console.log('The magic happens on port ' + port);