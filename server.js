// installs
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cheerio = require("cheerio");
const request = require("request");
const axios = require("axios");

// mongoose
const db = require("./models");
const databaseUrl = 'mongodb://localhost/coindesk';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.engine("handlebars", exphbs({defaultLayout: "main"}))
app.set("view engine", "handlebars")

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/coindesk", {
  useMongoClient: true
});


// Routes

app.get("/", function(req, res) {
	db.Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "There's nothing here yet. Please click \"Click for Latest Crypto News\" for latest news."});
		}
		else{
			res.render("index", {articles: data});
		}
	});
});

app.get("/scrape", function(req, res) {

    axios.get("https://www.coindesk.com/").then(function(response) {

      let $ = cheerio.load(response.data);
  
      $("div.medium").each(function(i, element) {

        let result = {};
  
        result.title = $(this)
          .find("h3")
          .text();
        result.link = $(this)
          .find("h3")
          .children()
          .attr("href");
        
        result.summary = $(this)
          .find("p")
          .text();
  
        db.Article
          .create(result)
          .then(function(dbArticle) {
            res.send("Scrape Complete");
          })
          .catch(function(err) {
            res.json(err);
          });
      });
      res.redirect("/");
    });
});

app.get("/saved", function(req, res) {
	db.Article.find({issaved: true}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "You do not have anything saved. Save something by clicking \"Save Article\""});
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});

app.get("/:id", function(req, res) {
	db.Article.findById(req.params.id, function(err, data) {
		res.json(data);
	})
})

app.post("/search", function(req, res) {
	console.log(req.body.search);
	db.Article.find({$text: {$search: req.body.search, $caseSensitive: false}}, null, {sort: {created: -1}}, function(err, data) {
		console.log(data);
		if (data.length === 0) {
			res.render("placeholder", {message: "Oops. Please try again with a different search query."});
		}
		else {
			res.render("search", {search: data})
		}
	})
});

app.post("/save/:id", function(req, res) {
	db.Article.findById(req.params.id, function(err, data) {
		if (data.issaved) {
			db.Article.findByIdAndUpdate(req.params.id, {$set: {issaved: false, status: "Save Article"}}, {new: true}, function(err, data) {
				res.redirect("/");
			});
		}
		else {
			db.Article.findByIdAndUpdate(req.params.id, {$set: {issaved: true, status: "Saved"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

app.post("/note/:id", function(req, res) {
	var note = new db.Note(req.body);
	note.save(function(err, doc) {
		if (err) throw err;
		db.Article.findByIdAndUpdate(req.params.id, {$set: {"note": doc._id}}, {new: true}, function(err, newdoc) {
			if (err) throw err;
			else {
				res.send(newdoc);
			}
		});
	});
});

app.get("/note/:id", function(req, res) {
	var id = req.params.id;
	db.Article.findById(id).populate("note").exec(function(err, data) {
		res.send(data.note);
	})
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
