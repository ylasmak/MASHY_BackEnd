var mongoose = require('mongoose');
var url = require("./../data_base/database_configuration");
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;

var countryCode = new Schema({

  ISO2: { type: String},
  ISO3: { type: String },
  Code:  String,
});
  
    // the schema is useless so far
// we need to create a model using it
var Country = mongoose.model('countryCode', countryCode);

// make this available to our users in our Node applications
module.exports = Country;
