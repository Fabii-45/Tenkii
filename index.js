var request = require('request'); 
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//*WEBHOOK*//

app.post('/webhook', function(req, res) {
	console.log('Received a post request');
	if(!req.body) return res.sendStatus(400)
	res.setHeader('Content-Type', 'application/json');
	console.log('here is a post request from Dialogflow');
	console.log(req.body);
	console.log('Got geo city parameter from Dialogflow' + req.body.queryResult.parameters['geo-city']);
		var city = req.body.queryResult.parameters['geo-city'];
		var w = getWeather(city);
		let response = " "; // Réponse de base du webhook pour montrer que cela fonctionne
		let responseObj = { 
			"fullfillmentText":response,
			"fullfillmentMessages":[{"text": {"text": [w]}}],
			"source":""
		}
		console.log('Here is the response to Dialogflow');
		console.log(responseObj);
		return res.json(responseObj);
})

//*WEATHER API*//

var apiKey = '2d8c612346a6f313c14b431d83aedf48'; //Clé API OpenWeather
var result

function cb(err, response, body) {
	if(err){
		console.log('error:', error);
	}
	var weather = JSON.parse(body)
	if(weather.message === 'city not found'){
		result = 'Unable to get weather' + weather.message;
	}
	else {
		result = ' Right now its ' + weather.main.temp+ ' degrees with ' + weather.weather[0].description;
	}
}

function getWeather(city){
	result = undefined;
	var url = 'http://api.openweathermap.org/data/2.5/weather?q=$(city)&units=imperial&appid=$(apiKey)';
	console.log(url);
	var req = request(url,cb);
	while(result === undefined) {
		require('deasync').runLoopOnce();
	}
	return result;
}