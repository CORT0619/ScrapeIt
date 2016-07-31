var express = require('express');
var app = express();

//declare the PORT
var PORT = process.env.PORT || 3000;

var request = require('request');
var cheerio = require('cheerio');

var mongojs = require('mongojs');


//make connection to db and collection(s)
var db = mongojs('scrapeit', ["scraped"]);
db.on('error', function(error){

	console.log("DB error: ", error);
});


//html routes
app.get('/news', function(req, res){

	db.scraped.find({}, function(err, results){

		if(err) throw err;

		res.json(results);

	});


});

app.get('/scrapeit', function(req, res){

	//request('http://www.howtogeek.com/howto/23319/beginner-geek-do-more-with-windows-7-sticky-notes/', function(err, response, html){
	request('http://customwire.ap.org/dynamic/fronts/HOME?SITE=AP&SECTION=HOME', function(err, response, html){
	
		console.log(html);

		var $ = cheerio.load(html);

		$('.ap-newsbriefitem').each(function(i, element){
			var link = $(this).find('a.ap-newsbriefitem-a').attr('href');
			var firstOfLink = 'http://customwire.ap.org';
			var link = firstOfLink + link;

			var title = $(this).find('span.topheadline').text();

			var blurb = $(this).find().text();

			console.log("blurb is ", blurb);

			/*db.scraped.find({"paragraph": text}, function(err, results){

				if (err) throw err;

				if(results == ""){

					db.scraped.insert({"paragraph": text}, function(err, document){

						if (err) throw err;

						console.log("something ", document);

					});
					

				} else {


					console.log("dup document");
				}

			});*/


		});

	//res.send("Website Successfully Scraped.");

	});

});


//listen on PORT
app.listen(PORT, function(){

	console.log('Listening on port 3000.');
});