var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var noteSchema = new Schema({
  // The headline is the article associated with the note
  _headlineId: {
    type: Schema.Types.ObjectId,
    ref: "Headline"
  },
  date: {
    type: Date,
    default: Date.now
  },
  noteText: String
});

var note = mongoose.model("Note", noteSchema);

// Export the Note model
module.exports = note;