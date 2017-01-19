var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var parse = require('csv-parse');


var dmn = require('./Model/domaine_analysis');
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

    dmn.count({}, function(err, count) {
        if (err) {
            console.log(err);

        } else {
            res.render('pages/index.ejs', {
                nbre_Domaine: count
            })
        }


    });


    ;
});

router.get('/AddNewDomaine', function(req, res) {
    res.render('pages/newAnalysis.ejs');
});

router.post('/PostAddNewDomaine', upload.single('lexiconDataBase'), function(req, res) {

    if (req.file) {

        fs.readFile("./uploads/" + req.file.filename, 'utf8', function(err, data) {
            if (err) throw err;

            parse(data, {
                columns: true
            }, function(err, output) {
                if (err) console.log(err);

                var domaine = new dmn({
                    domaine_name: req.body.domaineName,
                    domaine_language: req.body.domaineLanguage,
                    domaine_trainingScript: req.body.trainingScript,
                    domaine_lexicon_data_base: output,
                    created_at: Date.now()
                });

                domaine.save(function(err, domaine) {
                    if (err) {
                        console.log(err);
                    }

                    req.session.domaine = domaine;
                    req.method = 'get';
                    res.redirect('/edit_domaine');
                });
            });

        })
    }

});

router.get("/edit_domaine", function(req, res) {


    if (req.query.id) {

        dmn.findById(req.query.id, function(err, domaine) {
            if (err) {
                console.log(err);
            } else {

                req.session.domaine = domaine;
                res.render('pages/edit_analysis.ejs', {
                    tagline: req.session.domaine.domaine_trainingScript
                });

            }
        })
    } else {
        res.render('pages/edit_analysis.ejs', {
            tagline: req.session.domaine.domaine_trainingScript
        });
    }
});

router.post('/importTrainingScrip', upload.single('trainingScript'), function(req, res) {

    if (req.file) {

        fs.readFile("./uploads/" + req.file.filename, 'utf8', function(err, data) {
            if (err) console.log(err);
            req.session.domaine.domaine_trainingScript = data;

            req.method = 'get';
            res.redirect('/edit_domaine');

        })
    }

});

router.post('/updateScript', urlencodedParser, function(req, res) {



    dmn.findById(req.session.domaine._id, function(err, domaine) {
        if (err) {
            console.log(err);
        }
        domaine.domaine_trainingScript = req.body.script
        domaine.save(function(err, domaine) {

            if (err) {
                console.log(err);
            }
            req.session.domaine = domaine;
            req.method = 'get';
            res.redirect('/edit_domaine');
        })


    })

});

router.get('/domaine_list', function(req, res) {

    dmn.aggregate([{
        $project: {
            _id: 1,
            domaine_name: 1,
            domaine_language: 1

        }
    }], function(err, result) {
        if (err) {
            console.log(err);

        } else {


            res.render('pages/list_domaine.ejs', {
                datas: result
            });
        }

    });
});

router.get('/training_dataSet', function(req, res) {

    var domaine = req.session.domaine;

    if (domaine) {
        var instance = new mongo();

        var collection;

        if (req.query.type == 'training') {
            collection = domaine.domaine_training_data;
        }
        if (req.query.type == 'test') {
            collection = domaine.domaine_test_data;
        }

        instance.collectionExist(collection, function(err, result) {
            if (err)
                throw err;
            if (result) {
                instance.pagination(collection, {}, 0, 250, function(err, data) {

                    var myJson = data[0];
                    var array_column = new Array();
                    var i = 0;
                    for (var key in myJson) {
                        array_column[i] = key;
                        i = i + 1;
                    }

                    res.render('pages/learning_data.ejs', {
                        columns: array_column,
                        dataSet: data
                    });

                });
            } else {
          
                res.render('pages/learning_data.ejs', {
                    columns: null,
                    dataSet: null
                });
            }

        });

    }
})


router.post('/importTrainingData', upload.single('trainingData'), function(req, res) {

    console.log('importTrainingData')
    fs.readFile("./uploads/" + req.file.filename, 'utf8', function(err, data) {
        if (err) throw err;

        parse(data, {
            columns: true
        }, function(err, output) {


            dmn.findById(req.session.domaine._id, function(err, domaine) {
                if (err) {
                    console.log(err);
                } else {

                    domaine.domaine_training_data = domaine.domaine_name + '_' + 'training_data'
                    domaine.save(function(err, domaine) {
                        if (err) {
                            console.log(err);
                        } else {

                            req.session.domaine = domaine;
                            var instance = new mongo();
                            instance.insertMany(domaine.domaine_training_data, output)

                            req.method = 'get';
                            res.redirect('/training_dataSet');
                        }
                    });
                }

            })

        });
    })
})


module.exports = router;