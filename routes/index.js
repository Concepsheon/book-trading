var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var passport = require("passport");
var local = require("passport-local").Strategy;

var Account = require("../models/account");
var config = require("../config");
var Book = require("../models/books");

var jwt = require("jsonwebtoken");
var book = require("google-books-catalogue-search");
//options for google book search
var options = {
	field: 'title',
	limit: 1,
	type: 'books',
	order: 'relevance',
	lang: 'en'
};


mongoose.connect(config.url, function(err, db){
    if(err){
        return console.log('failed to connect to database');
    }
    console.log("connected to database");
});

//config passport
router.use(passport.initialize());
passport.use(new local(Account.authenticate()));

router.get("/", function(req,res){
    res.render("index");
});

router.route("/register")

.get(function(req,res){
    res.render("register");
})

.post(function(req,res){
    Account.register(new Account({ username: req.body.username }), req.body.password, function(err,account){
        if(err){
            return console.log(err);
        }
        console.log('registered user', account.username);
        res.redirect("/");
    });
});

var token;
var decoded;

router.post("/login", passport.authenticate('local', {session:false, failureRedirect: "/"}), function(req,res){
    console.log("logged in", req.user.username);
    token = jwt.sign({user:req.user.username}, config.secret);
    res.redirect("/home");
});

/* PROTECTED ROUTES */


router.use(function(req,res,next){
    if(token !== undefined){
        decoded = jwt.verify(token, config.secret);
        next();
    } else {
        res.redirect("/");
    }
});

router.get("/home", function(req,res){
    Book.find(function(err, books){
        if(err){
            return console.log('no books found', err);
        }
       res.render("home", {books: books});
    });
});

router.get("/search/:book", function(req,res){
    var title = req.params.book;
    book.search(title, options, function(err, results){
        if(err){
            return console.log('could not find book', err);
        }
        res.json(results);
    });
});

router.get("/add", function(req,res){
    res.render("add");
});

router.route("/books")
.get(function(req, res) {
    console.log(decoded.user);
    var query = Book.find({added_by: decoded.user});
    
    query.exec(function(err, books){
        if(err){
            return console.log('no books have been added by this user', err);
        }
        res.render("books", {
            books: books,
            user: decoded.user
        });
    });
})

.post(function(req,res){
    var book = new Book(req.body);
    book.added_by = decoded.user;
    
    book.save(function(err, book){
        if(err){
            return console.log('could not save book', err);
        }
        console.log(book);
        res.json(book);
    });
});



router.route("/profile")
.get(function(req, res) {
    var query = Account.findOne({ username: decoded.user });
    
    query.exec(function(err, account){
        if(err){
            return console.log('no account found for this username', err);
        }
        res.render("profile", {account: account});
    });
})

.put(function(req,res){
    var query = {username: decoded.user}
    
    Account.findOneAndUpdate(query, req.body, function(err, account){
        if(err){
            return console.log('could not find account', err);
        }
        account.save(function(err, account){
            if(err){
                return console.log(err);
            }
            console.log(account);
        });
    });
    
});

router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

module.exports = router;
