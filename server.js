'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.set('port', (process.env.PORT || 1340))

// Process data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// ROUTES
app.get('/', function(req, res) {
  res.send("Howdy! I am a chatbot!");
});

// Facebook
app.get('/webhook/', function(req, res) {
  if(req.query['hub.verify_token'] === 'someTokenHere') {
    res.send(req.query['hub.challenge'])
  }

  res.send("Wrong token");
});

app.listen(app.get('port'), function() {
  console.log("Running on port: +", app.get("port"));
});
