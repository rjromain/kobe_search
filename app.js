	var express = require('express'),
		bodyParser = require('body-parser'),
		session = require('express-session'),
		request = require('request'),
		pg = require('pg'),
		methodOverride = require('method-override');
		db = require('./models');

	var app = express();
	//view engine for the app
	app.set('view engine', 'ejs');

	app.use(session({
	secret: "I'm very very secret thing",
	resave: false,
	saveUninitialized: true,
	save: {
		uninitialize: true
	}
	}));

	
	app.use(express.static(__dirname + '/public'));


	//access to body-parser npm module 
	app.use(bodyParser.urlencoded({extended: true}));

	app.use(methodOverride("_method"));

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
		res.render("index", {title: "Kobe search"});
	});
	// route to render search and search query
	app.get('/search', function(req,res){
		var q = req.query.q;
		if (!q) {
		res.render("search", {results: [], noResults: true});
		}else{
			
			//var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=kobe%20' + q;
			//var url2 = 'https://ajax.googleapis.com/ajax/services/search/keyword?v=1.0&q=kobe%20' + q;
			var url3 = 'http://www.reddit.com/search.json?q=kobe%20' + q;
			request(url3, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					// var results = JSON.parse(body).responseData.results;
					var results = JSON.parse(body).data.children;
					console.log(results);
					
					res.render('search', { results: results });
				} else {
					res.send('Something went wrong with the API');
				}
			});
		} 
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

	app.delete('/logout', function(req,res){
		req.logout();
		res.redirect('/login');
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
	 app.get('/profile', function(req,res){
	 	if (req.session.userId){
	 		db.User.find(req.session.userId)
	 		.then(function(dbUser) {
	 			dbUser.getLikes()
	 			.then(function(dbkobe) {
	 				//console.log(dbkobe);
	 				res.render('profile', {user: dbUser, results: dbkobe});
	 			})
	 		})
	 	} else { 
	 		res.redirect('/login');
	 	}
	 });
	 		
	 app.post('/favorites', function(req,res){
	 	var kobe = req.body.kobe;
	 	console.log("THIS IS KOBE", kobe);
	 	debugger;
	 	req.currentUser().then(function(dbUser){
	 		if (dbUser) {
	 			dbUser.addToFavs(db, kobe).then(function(fav){
	 				//console.log("THIS IS THE FAV", fav);
	 				res.redirect('/profile');
	 			});
	 		} else {
	 			res.redirect('login');
	 		}
	 	});
	 });

app.listen(process.env.PORT || 3000)

