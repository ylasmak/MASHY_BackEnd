
// grab the things we need
var mongoose = require('mongoose');
var GeoJSON = require('mongoose-geojson-schema');
var url = require("./../data_base/database_configuration");
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;
mongoose.connect( url);

var CercleDef = new Schema({ Login: String ,ActiveTracking :  Boolean});

var GeojsonfeatureSchema = new Schema({
        type: {type: String},
        'coordinates' : {
            'type' : [Number],
            'index' : '2dsphere'
        }    
});

var USERS = new Schema({

  Login: { type: String, required: true, unique: true },
  Phone: { type: String, required: true, unique: true },
  SerialNumber : {type: String, required: true, unique: true}, 
  cercle: [CercleDef],
  location :GeojsonfeatureSchema,  
  activate_tracking :{ type : Boolean } , 
  secret : String,
  CallingcountryCode : String,
  update_at: String
});


 
// the schema is useless so far
// we need to create a model using it
var USERSModel = mongoose.model('USERS', USERS);



// make this available to our users in our Node applications
module.exports = USERSModel;