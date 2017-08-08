var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var session = require('express-session')
var dateFormat = require('dateformat')
var truncate = require('truncate-html')

var routes = require('./routes/index');
var posts = require('./routes/posts');
var post = require('./routes/post')
var login = require('./routes/login')
var logout = require('./routes/logout')
var signup = require('./routes/signup')
var plans = require('./routes/plans')
var premium = require('./routes/premium')
var api = require('./routes/api')

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.locals.stripeKeyPublishable = process.env.STRIPE_PUBLISHABLE_KEY
app.locals.stripeKeySecret = process.env.STRIPE_SECRET_KEY

var stripe = require('stripe')(app.locals.stripeKeySecret)


var config = require('./config')

app.locals.config = config

app.set('trust proxy', 1)
app.use(session({
  secret: 'sjcimsoc',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// view engine setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: {
    date: function(date) {
      return dateFormat(new Date(date), "dddd, mmmm dS, yyyy")
    },
    truncateText: function(text, length) {
      return truncate(text, length, { stripTags: true, byWords: true })
    }
  }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3000);
app.set('securePort', process.env.SECURE_PORT || 8080)

app.set('forceSSLOptions', {
  httpsPort: app.get('securePort')
})

app.use('/', routes);
app.use('/post', post)
app.use('/posts', posts)
app.use('/login', login)
app.use('/logout', logout)
app.use('/signup', signup)
app.use('/plans', plans)
app.use('/premium', premium)
app.use('/api', api)

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
