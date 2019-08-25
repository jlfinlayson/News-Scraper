var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapeData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("database error: ", error);
});

app.get("/", function (req, res) {
    res.render("index")
})

app.get("/all", function (req, res) {
    db.scrapeData.find({}, function (err, data) {
        if (err) throw err;
        res.json(data);
    });
});

app.get("/scraper", function (req, res) {
    axios.get("https://www.altpress.com/news/").then(function (response) {
        var $ = cheerio.load(response.data);

        $(".td_module_10").each(function (i, element) {
            var title = $(element).children(".item-details").children("h3").text();
            var link = $(element).children(".item-details").children("h3").children("a").attr("href");
            var summary = $(element).children(".item-details").children(".td-excerpt").text();
            var image = $(element).children(".td-module-thumb").children("a").children("img").attr("src");

            db.scrapeData.insert({
                title: title,
                link: link,
                summary: summary,
                image: image
            }, function (err, data) {
                if (err) throw new err;
            });
            console.log(title);
            console.log(link);
            console.log(summary);
            console.log(image);
        });
    });
});

app.listen(3000, function () {
    console.log("App running on port 3000!");
});