var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var parse = require('csv-parse');



var users = require('./Model/USERS');
var mongo = require('./data_base/mongodb');

var router = express.Router();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
var upload = multer({
    dest: './uploads/'
});
//middle ware that is specific to this router


router.get('/', function(req, res) {

    users.count({}, function(err, count) {
        if (err) {
            console.log(err);

        } else {
            res.send('MASHY V0.1')
            
           // res.send('pages/index.ejs', {
             //   nbre_Domaine: count
            //})
            console.log(count)
        }


    });


    ;
});

router.post('/connexion',urlencodedParser, function(req, res) {
    
   
    var login  = req.body.Login;
    var password = req.body.Password;
 
   
    users.findOne({Login : login,Password : password}).exec(function(err,user)
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
                         res.send("{sucess : -1, message : 'ErrorLoginPassword'}")
                     }
                 else
                     {
                       
                         res.send("{sucess : 1, message : "+user+"}")
                     }
             }
        
    })
    
});

router.post('/lookup',urlencodedParser,function(req,res)
{
    
    
    var parmeters = req.body.Parmeters;    
   
    var jsonContent = JSON.parse(parmeters);
    requesterLogin =jsonContent.Login
    myPositioin = jsonContent.Location
    
    console.log(requesterLogin)
    console.log(myPositioin)
    
    users.findOne({Login : requesterLogin}).exec(function(err,user)
     {         
         
         if(err)
            {
                console.log(err)
                res.send("{sucess : 0, error : "+err+"}")
            }
         else
             {       
                 
                 if(myPositioin)
                     {
                         console.log('-----AQW-----------')
                         console.log(user.location)
                         console.log(user.location.coordinates)
                         
                         
                         
                          users.update({'Login': requesterLogin}, { $set: { geometry : myPositioin }},
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
                if ( user.cercle.length > 0)
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
                                     console.log(err)
                                      res.send("{sucess : 0, error : "+err+"}")
                                 }                         
                             }        
                        )
                         
                          users.aggregate([{
                                $project: {
                                    Login: 1,
                                    location: 1,
                                    _id : -1
                                }},
                                             {$match : 
                                {
                                   Login : {$in : array_column} 
                                }

                            }], function(err, result) {

                              if(err)
                                  {
                                     
                                      res.send("{sucess : 0, error : "+err+"}")
                                  }
                                else
                                    {
                                        
                                        
                                        for(var i = 0;i< result.length; i++)
                                           {
                                                                 
                                           }
                                        
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
    )}
 );

  

module.exports = router;