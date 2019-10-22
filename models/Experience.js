var mongoose = require('mongoose')
var Schema = mongoose.Schema

const experienceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String
  }

})

module.exports = mongoose.model('Experience', experienceSchema)
