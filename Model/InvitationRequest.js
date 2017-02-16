var mongoose = require('mongoose');
var url = require("./../data_base/database_configuration");
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;

var InvitationRequest = new Schema({

  OriginRequestPhoneNumber: { type: String},
  InvitationPhoneNunber: { type: String },
  InvitationDate :  Date
});
  
    // the schema is useless so far
// we need to create a model using it
var InvitationRequest = mongoose.model('InvitationRequest', InvitationRequest);

// make this available to our users in our Node applications
module.exports = InvitationRequest;
