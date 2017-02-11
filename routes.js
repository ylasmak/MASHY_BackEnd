var express = require('express');
var bodyParser = require('body-parser');
var otp = require('otplib/lib/totp');




var users = require('./Model/USERS');
var country = require('./Model/countryCode');
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

router.post('/connexion',urlencodedParser, function(req, res) {
    
    
    var PhoneNumber   = req.body.PhoneNumber;
    var SerialNumber  = req.body.SerialNumber;
    var CountryCode = req.body.CountryCode;
    
    console.log(PhoneNumber)
    console.log(SerialNumber)
    console.log(CountryCode)
    if(CountryCode)
        {
            CountryCode = CountryCode.toUpperCase();
        }
    if(PhoneNumber)
        {
           if(!PhoneNumber.startsWith("+"))
               {
                    PhoneNumber = '+'+PhoneNumber;    
               }
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
             if(!PhoneNumber.startsWith("+"))
               {
                    PhoneNumber = '+'+PhoneNumber;    
               }
            console.log(PhoneNumber)
            
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
    
    console.log("register")
    
    if(!PhoneNumber.startsWith("+"))
               {
                    PhoneNumber = '+'+PhoneNumber;    
               }
    
    console.log(SerialNumber)
    console.log(PhoneNumber)
    console.log(email) 
    
    var secret = otp.utils.generateSecret();

   
    var contact =  new users({
          Login : email,
          Phone : PhoneNumber,
          SerialNumber : SerialNumber,
          activate_tracking : false,
          secret :secret,
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
                       
                       // Twilio Credentials
                       // var accountSid = 'AC2f9abe85ad8dffdb2dd94f9e975ce8f9';
                       // var authToken = 'f840a2eaaf3f7d1a1c6cf89b50610789';

                        //require the Twilio module and create a REST client
                        var client = require('twilio')(accountSid, authToken);
                        var code = otp.generate(secret);
                        
                        console.log(secret)
                        console.log(code)    
                         
                        res.send("{sucess : 1, message : "+user+"}")
                        
                       /* client.messages.create({
                            to: PhoneNumber,
                            from: '+14438254761',
                            body: code,
                        }, function (err, message) {
                           if(err)
                               {
                                   res.send("{sucess : -1, message : 'Error Sending confirmation email'}")
                               }
                            else
                                {
                                    req.session.secret = secret; 
                                    res.send("{sucess : 1, message : "+user+"}")
                                }
                        }); */
                        
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

router.post('/getCountryCode',urlencodedParser,function(req,res)
          {
    
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
                                console.log(countryResult)
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


  

module.exports = router;