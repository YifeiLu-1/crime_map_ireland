const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){
  res.render("home");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/data", function(req, res){
  res.render("data");
});

app.get("/api/data/:year", function(req, res){
  const year = req.params.year;
  const dataPath = "./data/data_" + year + ".json";
  const data = require(dataPath);
  res.send(data);
});

let port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
