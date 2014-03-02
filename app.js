var express = require('express'),
  exphbs  = require('express3-handlebars'),
  helpers = require('./src/helper'),
  authService = require("./src/services/authentication_service"),
  app = express(),
  dashboardroutes = require('./routes/dashboard'),
  authenticateroutes = require('./routes/authenticate'),
  path = require('path'),
  hbs;

var authenticationChecker = function(req, res, next) { 
  if (req.session.user && req.session.user.isAuthenticated) {
    next();   
  } else {
    res.redirect('/');   
  }
};

// Create `ExpressHandlebars` instance with a default layout.
hbs = exphbs.create({
    defaultLayout: 'main',
    helpers      : helpers,

    partialsDir: [
        'views/partials/'
    ]
});

authService.initLdap('ldap://10.20.41.90:389');

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3006);

app.use(express.bodyParser());
app.use(express.cookieParser('featuretoggle'));
app.use(express.session());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', authenticationChecker, dashboardroutes.index);
app.get('/', authenticateroutes.authenticate);
app.get('/feature/:id', authenticationChecker, dashboardroutes.feature);

app.post('/', authenticateroutes.login);

console.log('Starting up feature toggle dashboard on port ' + app.get('port'));

app.listen(app.get('port'));

