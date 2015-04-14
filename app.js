var express = require('express'),
		bodyParser = require('body-parser'),
		session = require('express-session'),
		request = require('request'),
		pg = require('pg'),
		db = require('./models');

	var app = express();
	//view engine for the app
	app.set('view engine', 'ejs');

	app.use(session({
	secret: "I'm very very secret thing",
	resave: false,
	save: {
		uninitialize: true
	}
}));


	//access to body-parser npm module 
	app.use(bodyParser.urlencoded({extended: true}));

app.use("/", function(req,res,next) {
	req.login = function(user) {
		req.session.userId = user.id;
	},
	req.currentUser = function() {
		return db.User.find(req.session.userId)
		         .then(function(dbUser) {
		         	req.user = dbUser;
		         	return dbUser;
		         });
	},
	req.logout = function() {
		req.session.userId = null;
		req.user = null;
	};
	next();
});


	//root route for the app
	app.get('/', function(req, res){
		res.render("index", {title: "InstaSave"});
	});
	// route to render search page
	app.get('/search', function(req,res){
		res.render('search');
	});


	//login route
	app.get('/login', function(req,res){
		req.currentUser().then(function(user){
			if (user) {
				res.redirect('/profile');
			} else {
				res.render("login");
			}
		});
	});

	app.post("/login", function(req, res){
	var user= req.body.user;

		db.User.authenticate(user.email, user.password)
			.then(function(user){
				req.login(user);
				res.redirect('/profile');
			});
});
	//sign up route
	app.get('/signup', function(req, res){
		res.render('signup');
	});

	app.post('/signup', function(req,res){
	var email = req.body.email;
	var password = req.body.password;
	var firstName = req.body.first;
	var lastName = req.body.last;
	var phone = req.body.phone;
	var userN = req.body.usrname;
	db.User.createSecure(email,password,firstName,lastName,phone,userN)
	  .then(function(user){
	  	res.redirect('login');
	  });
});


	//profile route
	// app.get('/profile', function(req,res){
	// 	res.render('profile', user: );
	// });

	db.sequelize.sync().then(function() {
	app.listen(3000, function() {
		console.log('Server listening on port 3000');
	});
});