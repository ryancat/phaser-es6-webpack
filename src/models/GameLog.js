// game log mongoose model

// Imports - 3rd party
const mongoose = require('mongoose');

const GameLog = new mongoose.Schema({
  sign: { type: String, default: 'A Ninja has no name', trim: true },


  
  summary: { type: String, default: '', trim: true },
  viewCount: { type: Number, default: 0 },
  cues: [{
    description: { type: String, default: '', trim: true },
    phase: { type: String, default: 'TODO', trim: true, 
      // validation
      enum: ['TODO', 'QUOTING', 'APPROVING', 'FIXING', 'DONE'] }
  }],
  tags: [{ type: String, trim: true }],
  description: { type: String, default: '', trim: true },
  step: { type: Number, default: 1, min: 1, max: 5 },
  location: { type: String, default: '', trim: true },
  category: { type: String, default: '', trim: true },
  isUrgent: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Validation
IssueSchema.path('summary').validate(function (summary) {
  return summary.length;
}, 'Summary cannot be blank');

// IssueSchema.path('location').validate((location) => {
//   return location.length;
// }, 'Location cannot be blank');

// IssueSchema.path('category').validate((category) => {
//   return category.length;
// }, 'Category cannot be blank');

// Methods
IssueSchema.methods = {};

// Create issue model
mongoose.model('Issue', IssueSchema);