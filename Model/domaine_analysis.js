
// grab the things we need
var mongoose = require('mongoose');
var url = require("./../data_base/database_configuration");
var Schema = mongoose.Schema;

console.log(url);
mongoose.Promise = global.Promise;
mongoose.connect( url);
// create a schema
var domaineSchema = new Schema({

  domaine_name: { type: String, required: true, unique: true },
  domaine_language: { type: String, required: true },
  domaine_trainingScript:  String,
  domaine_predictionScript:  String,
  domaine_lexicon_data_base: [],
  domaine_training_data :  String,          
  created_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Domaine = mongoose.model('Domaine', domaineSchema);

// make this available to our users in our Node applications
module.exports = Domaine;

