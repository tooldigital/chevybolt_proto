var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')

var logoDetect = require('./logodetector');

var app = express();

app.set('view engine', 'pug');
app.use(express.static('static'));
app.use(express.static('tmp'));
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

app.post('/analyzephoto', function(req, res) {
	logoDetect(req.body.image, req.headers.host)
		.then(function(result) {
			console.log('logo detection finished');
			res.send(result);
		});
});

app.get('/', function (req, res) {
	console.log('load index')
	res.render('index');
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
