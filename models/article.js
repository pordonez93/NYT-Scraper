var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var articleSchema = new Schema({
  article: {
    type: String,
    required: true,
    unique: { index: { unique: true } }
  },
  summary: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  saved: {
    type: Boolean,
    default: false
  }
});

var article = mongoose.model("article", articleSchema);

// Export the article model
module.exports = article;