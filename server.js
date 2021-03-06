
//dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

var mongojs = require('mongojs');

//declare the PORT
var PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static('public'));


//make connection to db and collection(s)
	//var db = mongojs('scrapeit', ["scraped"]);
var uri  = process.env.MONGODB_URI/* || 'mongodb://heroku_xwz9mmg1:hfh9fn7753olc67h9fopv5vfj8@ds145355.mlab.com:45355/heroku_xwz9mmg1';*/

var db = mongojs(process.env.MONGODB_URI);
db.on('error', function(error){

	console.log("DB error: ", error);
});


//html routes
app.get('/', function(req, res){
	res.send(index.html);
});


app.get('/news', function(req, res) {
	db.scraped.find({}, function(err, results){

		if(err) throw err;

		res.send(results);
		
	});
})

app.post('/delete', function(req, res){

	db.scraped.update({_id: mongojs.ObjectId(req.body.objID)}, {$pull: {comments: {name: req.body.name, date: req.body.date}}}, function(err){

		if(err) throw err;

		res.send({});
	});


});

app.post('/comments', function(req, res){

	db.scraped.update({_id: mongojs.ObjectId(req.body.objID)}, {$push: {comments: {"name": req.body.name, "date": req.body.date, "comment": req.body.comments}}}, {$upsert: false}); 

	res.send({});

});

app.get('/showComments', function(req, res){

	db.scraped.find({_id: mongojs.ObjectId(req.query.objID)}, {"comments": 1}, function(err, results){	

		if(err) throw err;

		res.send(results);
		
	});
});

app.get('/scrapeit', function(req, res){

	request('http://customwire.ap.org/dynamic/fronts/HOME?SITE=AP&SECTION=HOME', function(err, response, html){
	
		var $ = cheerio.load(html);

		$('.ap-newsbriefitem').each(function(i, element){

			//grabs and assembles the url to the article
			var link = $(this).find('a.ap-newsbriefitem-a').attr('href');
			var firstOfLink = 'http://customwire.ap.org';
			var link = firstOfLink + link;

			// grabs the headline of the article
			var title = $(this).find('span.topheadline').text();

			//grabs the brief body of the article
			var blurb = $(this).find('span.topheadlinebody').text();


			db.scraped.find({"headline": title}, function(err, results){

				if (err) throw err;

				if(results == ""){

					db.scraped.insert({"headline": title, "articleURL": link, "blurb": blurb}, function(err, document){

						if (err) throw err;

						console.log("something ", document);

					});
					

				} else {


					console.log("dup document");
				}

			});


		});

	res.send("Website Successfully Scraped.");

	});

});


//listen on PORT
app.listen(PORT, function(){
	console.log('Listening on port 3000.');
});