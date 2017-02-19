var express = require('express');
var bodyParser = require('body-parser');
var otp = require('otplib/lib/totp');




var users = require('./Model/USERS');
var country = require('./Model/countryCode');
var invitation = require('./Model/InvitationRequest');
var mongo = require('./data_base/mongodb');

var router = express.Router();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

//twilio token
var accountSid = 'AC2f9abe85ad8dffdb2dd94f9e975ce8f9';
var authToken = 'f840a2eaaf3f7d1a1c6cf89b50610789';
//middle ware that is specific to this router


router.get('/', function(req, res) {

    users.count({}, function(err, count) {
        if (err) {
            console.log(err);

        } else {
            res.send('MASHY V0.5')           
                    
        }

    });
});


router.get('/apk', function(req, res) {
    
    path = __dirname + '/apk/app-debug.apk'
    
  res.download(path);
    
}
           );


router.get('/chanelList', function(req, res) {
    
    path = __dirname + '/list/list.m3u'
    
  res.download(path);
    
}
           );

router.post('/connexion',urlencodedParser, function(req, res) {
    
    
    var PhoneNumber   = req.body.PhoneNumber;
    var SerialNumber  = req.body.SerialNumber;
    var CountryCode = req.body.CountryCode;
    
    console.log(PhoneNumber)
    console.log(SerialNumber)
    console.log(CountryCode)
    
   
    if(PhoneNumber)
        {
        
            users.findOne({Phone : PhoneNumber,SerialNumber : SerialNumber}).exec(function(err,user)
                           {
                    if(err)
                        {

                           console.log(err)
                            res.send("{sucess : 0}")
                        }
                     else
                         {
                             if(!user)
                                 { 
                                     country.findOne({'ISO2' : CountryCode}).exec(function(err,countryResult)
                                     {
                                            if(err)
                                                {
                                                   console.log(err)
                                                   res.send("{sucess : 0}")
                                                }
                                            else
                                                {
                                                    
                                                    if(countryResult)
                                                        {
                                                            res.send("{sucess : -1, message : 'ErrorLogin' ,'Country' : "+countryResult+"}")
                                                        }
                                                        else
                                                            {
                                                                 res.send("{sucess : -1, message : 'ErrorLogin' }")
                                                            }
                                                }
                                        });
                                     
                                 }
                             else
                                 {

                                     res.send("{sucess : 1, message : "+user+"}")
                                 }
                         }

                })
        }
    else
        {
            res.send("{sucess : 0}");
        }
    
});

router.post('/verify',urlencodedParser, function(req, res) {
    
   var PhoneNumber  = req.body.PhoneNumber;
   var OTPCode  = req.body.OTPCode;
    
   console.log('verify')
    
    
     
    if(PhoneNumber)
        {
                        
            users.findOne({Phone : PhoneNumber}).exec(function(err,user)
                           {
                    if(err)
                        {

                            console.log(err)
                            res.send("{sucess : 0}")
                        }
                     else
                         {
                             if(!user)
                                 {
                                   console.log('user not found')
                                     res.send("{sucess : -1, message : 'ErrorLoginPassword'}")
                                 }
                             else
                                 {
                                     var otp = require('otplib/lib/totp');
                                     var secret = user.secret ;
                                     console.log(secret);
                                     var status = otp.check(OTPCode, secret);
                                     console.log(status)
                                     if(status)
                                         {
                                                user.activate_tracking = true;
                                                user.save(function(err, domaine) {

                                                                        if (err) {
                                                                           res.send("{sucess : -1, message : 'ErrorUpdating'}")
                                                                        }
                                                     else
                                                         {
                                                              res.send("{sucess : 1, message : "+user+"}")
                                                         }
                                                 })
                                         }
                                      else
                                          {
                                              res.send("{sucess : -2, message : 'Error VerificationCode'}")
                                          }
                                     
                                    
                                 }
                         }

                })
        }
    else
        {
            res.send("{sucess : 0}");
        }
   
   
    
});

router.post('/register',urlencodedParser, function(req, res) {
    
    
  
    var SerialNumber  = req.body.SerialNumber;
    var PhoneNumber  = req.body.PhoneNumber;
    var email = req.body.Email;
    var CallingcountryCode = req.body.CountryCallCode;
    
   console.log("register")
  // PhoneNumber ="+212655994768"
    
    console.log(SerialNumber)
    console.log(PhoneNumber)
    console.log(email) 
    console.log(CallingcountryCode) 
    
    var secret = otp.utils.generateSecret();

   
    var contact =  new users({
          Login : email,
          Phone : PhoneNumber,
          SerialNumber : SerialNumber,
          activate_tracking : false,
          secret :secret,
          CallingcountryCode :CallingcountryCode,
          update_at : new Date().toUTCString()
     });
  
  
            
     contact.save(function(err, user) {
        if(err)
            {
              
                console.log(err)
                res.send("{sucess : 0}")
            }
         else
             {
                 if(!user)
                     {
                         res.send("{sucess : -1, message : 'ErrorLoginPassword'}")
                     }
                 else
                     {
                       
                       
                        //require the Twilio module and create a REST client
                        var client = require('twilio')(accountSid, authToken);
                        var code = otp.generate(secret);
                        
                        console.log(secret)
                        console.log(code)    
                         
                        //res.send("{sucess : 1, message : "+user+"}")
                        
                        client.messages.create({
                            to: PhoneNumber,
                            from: '+14438254761',
                            body: code,
                        }, function (err, message) {
                           if(err)
                               {
                                  console.log(err)
                                   res.send("{sucess : -1, message : 'Error Sending confirmation email'}")
                               }
                            else
                                {
                                  console.log('message')                                 
                                 res.send("{sucess : 1, message : "+user+"}")
                                }
                        }); 
                        
                     }
             }
        
    })
    
});

router.post('/lookup',urlencodedParser,function(req,res){
    
    console.log(req.body)
    var parmeters = req.body.Parmeters;   
    var jsonContent = JSON.parse(parmeters);
    
    requesterLogin =jsonContent.Login;
    myPositioin = jsonContent.Location;
    
    users.findOne({Login : requesterLogin}).exec(function(err,user)
     {         
         
         if(err)
            {
         
                res.json("{sucess : 0, error : "+err+"}")
            }
         else
             { 
                 if(!user)
                     {
                           res.json("{sucess : -1, error : Login Error}")
                     }
                 
                 else
                     {
                         if(myPositioin)
                             {
                                 var datetime = new Date().toUTCString();
                                  users.update({'Login': requesterLogin}, { $set: { location :  {  "type" : "Point",
                                                                                                            "coordinates" : myPositioin
                                                                                                        },update_at : datetime  }},
                                       function(err,result)
                                       {
                                            if(err)
                                                {
                                                    console.log(err)
                                                }
                                            else
                                                {
                                                    console.log(result)
                                                }

                                        })
                             }

                         
                        var array_column = new Array();               
                        if (user.cercle && user.cercle.length > 0)
                        {  

                                for(var i = 0;i< user.cercle.length; i++)
                                   {
                                     var person =  user.cercle[i];
                                     if(person.ActiveTracking)
                                        {
                                            array_column.push(person.Login)
                                        }                      
                                   }

                                 users.update({'Login': {$in : array_column }}, { $set: { activate_tracking : true }}, {multi: true},function(err,result)
                                    {        
                                         if(err)
                                         {
                                             
                                              res.json("{sucess : 0, error : "+err+"}")
                                         }                         
                                     }        
                                )

                                  users.aggregate([{
                                      $project: {
                                            Login: 1,
                                            location: 1,
                                            update_at:1,
                                            _id : -1
                                        }},
                                                     {$match : 
                                        {
                                           Login : {$in : array_column} 
                                        }

                                    }], function(err, result) {

                                      if(err)
                                          {

                                              res.json("{sucess : 0, error : "+err+"}")
                                          }
                                        else
                                            {
                                               
                                                res.json({sucess : 1, current : user , result : result})                                       

                                            }
                                    }
                                )   

                        }
                         else
                         {
                              res.json({sucess : 1, current : user }) 
                         }
                 
                     }
             }
          }
    )});

router.post('/getCountryCode',urlencodedParser,function(req,res) {
    
  var CountryCode = req.body.CountryCode;
    
    if(!CountryCode || !(CountryCode.length ==2 || CountryCode.length ==3))
        {
             res.send("{sucess : -1, message : 'No country' }")
        }
    
    CountryCode = CountryCode.toUpperCase()
    
    if(CountryCode.length ==2)
        {
    
            country.findOne({'ISO2' : CountryCode}).exec(function(err,countryResult)
                 {
                        if(err)
                            {
                               console.log(err)
                               res.send("{sucess : 0}")
                            }
                        else
                            {
                                
                                if(countryResult)
                                    {
                                        res.send("{sucess : 1, 'Country' : "+countryResult+"}")
                                    }
                                    else
                                    {
                                             res.send("{sucess : -1, message : 'No country' }")
                                    }
                            }
                    });
            
        }
    if(CountryCode.length ==3)
        {
    
            country.findOne({'ISO3' : CountryCode}).exec(function(err,countryResult)
                 {
                        if(err)
                            {
                               console.log(err)
                               res.send("{sucess : 0}")
                            }
                        else
                            {                                
                                if(countryResult)
                                    {
                                        res.send("{sucess : 0, 'Country' : "+countryResult+"}")
                                    }
                                    else
                                    {
                                             res.send("{sucess : -1, message : 'No country' }")
                                    }
                            }
                    });
            
        }
        
})


router.post('/requestInvitation',urlencodedParser,function(req,res)  {
    
     var OriginRequestPhoneNumber = req.body.OriginRequestPhoneNumber;
     var InvitationPhoneNunber = req.body.InvitationPhoneNunber;    
    
    console.log('requestInvitation')
    
     users.findOne({Phone : InvitationPhoneNunber}).exec(function(err,user){
         
         if(err)
             {
                console.log(err)
                res.send("{sucess : 0}")
             }
         else
             {
                
                 if(user)
                     {
                          invitation.findOne({OriginRequestPhoneNumber : OriginRequestPhoneNumber, InvitationPhoneNunber : InvitationPhoneNunber }).exec(function(err,result) {
          
                              if(err)
                                  {
                                     console.log(err)
                                     res.send("{sucess : 0}")
                                  }
                              else
                                  {
                                      if(result)
                                          {
                                                res.send("{sucess : -1,message :'AlredyExist'}")
                                          }
                                      else
                                          {
                                              var invit =  new invitation({
                                                      OriginRequestPhoneNumber : OriginRequestPhoneNumber,
                                                      InvitationPhoneNunber : InvitationPhoneNunber,
                                                      InvitationDate : new Date()
                                                 });
                                              invit.save(function(err, requestedInvitation) {

                                                  if(err)
                                                      {
                                                           console.log(err)
                                                           res.send("{sucess : 0}")
                                                      }
                                                  else
                                                      {
                                                            res.send("{sucess : 1,message :"+requestedInvitation+"}")
                                                      }
                                              })

                                          }
                                  }

                          })
                     }
                 else
                     {
                          res.send("{sucess : -2,message :'ContactNotExistInSystem'}")
                     }
             }
     })
} )

router.post('/requestNewCode',urlencodedParser, function(req, res) {
    
   var PhoneNumber  = req.body.PhoneNumber;
   var OTPCode  = req.body.OTPCode;
    
   console.log('requestNewCode')
    
   // PhoneNumber ="+212655994768"
     
    if(PhoneNumber)
        {
                        
            users.findOne({Phone : PhoneNumber}).exec(function(err,user)
                           {
                    if(err)
                        {

                            console.log(err)
                            res.send("{sucess : 0}")
                        }
                     else
                         {
                             if(!user)
                                 {
                                   console.log('user not found')
                                     res.send("{sucess : -1, message : 'UserNotFound'}")
                                 }
                             else
                                 {
                                    var otp = require('otplib/lib/totp');
                                    var secret = otp.utils.generateSecret();
                                    var code = otp.generate(secret);
                                  
                                    user.secret = secret;
                                    user.save(function(err, domaine) {

                                                            if (err) {
                                                               res.send("{sucess : -1, message : 'ErrorUpdating'}")
                                                            }
                                         else
                                             {
                                                var client = require('twilio')(accountSid, authToken);
                                                 
                                                 client.messages.create({
                                                    to: PhoneNumber,
                                                    from: '+14438254761',
                                                    body: code,
                                                }, function (err, message) {
                                                   if(err)
                                                       {
                                                          console.log(err)
                                                           res.send("{sucess : -1, message : 'Error Sending confirmation sms'}")
                                                       }
                                                    else
                                                        {
                                                          console.log('message')                                 
                                                         res.send("{sucess : 1, message : "+user+"}")
                                                        }
                                                });  

                                             }
                                     })
                                     
                                     
                                    
                                 }
                         }

                })
        }
    else
        {
            res.send("{sucess : 0}");
        }
   
   
    
});
  

module.exports = router;