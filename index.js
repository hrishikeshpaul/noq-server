const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');
var engine = require('consolidate');
var passport = require('passport')
var cors = require('cors')

var auth = require('./routes/auth');

var job = require('./routes/job')
var profile = require('./routes/profile');
var user = require('./routes/user');
var oauth = require('./routes/oauth');
var home = require('./routes/test');
const connectDB = require('./config/db');
connectDB();
app
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', (req, res) => res.render('pages/index'))
	.listen(PORT, () => console.log(`Listening on ${PORT}`))
app.use(cors())
app.use('/home', home);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': 'false' }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', auth);
app.use('/auth/linkedin', oauth)
app.use('/api/user', user);
app.use('/api/profile', profile);
app.use('/api/jobs', passport.authenticate('jwt', { session: false }), job);