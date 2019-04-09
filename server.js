var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path=require('path');
// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requiring Note and Article models
var Article = require("./models/Article.js");
var Note = require("./models/Note.js")

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

mongoose.Promise = Promise;
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/nytscraper", { useNewUrlParser: true });
var db = mongoose.connection;
// Show any mongoose errors
db.on("error", function(err) {
    console.log("Mongoose Error: ", err);
  });
  
// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Routes
//GET requests to render Handlebars pages
app.get("/", function(req, res) {
    Article.find({}, function(error, data) {
      var hbsObject = {
        article: data
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    });
  });
  
  app.get("/saved", function(req, res) {
    Article.find({"saved": true}).populate("notes").exec(function(error, articles) {
      var hbsObject = {
        article: articles
      };
      res.render("saved", hbsObject);
    });
  });
  
// A GET route for scraping the nytimes website
app.get("/scrape", function(req, res){
  // Scrape the NYTimes website
  axios.get("http://www.nytimes.com").then(function(response) {
    var $ = cheerio.load(response.data);
    var articles = [];

    $(".theme-summary").each(function(i, element) {
      var head = $(this)
        .children(".story-heading")
        .text()
        .trim();

      // Grab the URL of the article
      var url = $(this)
        .children(".story-heading")
        .children("a")
        .attr("href");
      //   Grab the summary
      var sum = $(this)
        .children(".summary")
        .text()
        .trim();

      // So long as our headline and sum and url aren't empty or undefined, do the following
      if (head && sum && url) {
        // We're removing extra lines, extra spacing, and extra tabs.
        var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        // Initialize an object we will push to the articles array
        var dataToAdd = {
          article: headNeat,
          summary: sumNeat,
          url: url
        };
        articles.push(dataToAdd);
      }
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/save", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// Delete a Note
// app.delete("/notes/delete:note_id/:article_id", function(req, res){
//   Note.findOneAndDelete({ _id: req.params.id},
//     function())
// })

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
