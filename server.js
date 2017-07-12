'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

// Facebook page token
let token = "EAAcAuxG36YUBAPhLIOtOmq8462soMCQfa3QDRKDQ8wZCLVhrHM4116wGPEdmhED6znA8IWeQCqK8NZCZCgfGhmy7cejbAofEP2JGtAjXetsZCwjmcuph58myRxOnsZA4AZBo5BLkLQkOHwZBwCyFBtAnD4ZAGjnLp6kKyRkgl1RbXjDmadY3ZBQIR"
const apiai = require("apiai");

const apiAIApp = apiai("75a1619b38fb4e298d11545d646e48b7 ");


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

// SEND Facebook
// app.post('/webhook/', function(req, res) {
//   let messaging_events = req.body.entry[0].messaging;
//
//   for(let i = 0; i < messaging_events.length; i++) {
//     let event = messaging_events[i];
//     let sender = event.sender.id;
//
//     if(event.message && event.message.text) {
//       let text = event.message.text;
//       sendMessage(event);
//     }
//   }
//   res.sendStatus(200)
// });
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

// Send messag back.
function sendMessage(event) {
  // let messageData = { text: text };
  // request({
  //   url: "https://graph.facebook.com/v2.6/me/messages",
  //   qs: { access_token: token },
  //   method: 'POST',
  //   json: {
  //     recipient: { id: sender },
  //     message: messageData
  //   }
  // }, function(error, response, body) {
  //   if(error) {
  //     console.log("Something went wrong!");
  //   }else if(response.body.error) {
  //     console.log('Error: ', response.body.error);
  //   }
  // })
  let sender = event.sender.id;
  let message = event.message.text;

  let apiai = apiAIApp.textRequest(message, {
    sessionId: 'someTokenHere'
  });

  apiai.on('response', (response) => {
    // Response from API, POST to facebook messenger
    let aiMessage = response.result.fulfillment.speech;

    request({
     url: "https://graph.facebook.com/v2.6/me/messages",
     qs: { access_token: token },
     method: 'POST',
     json: {
       recipient: { id: sender },
       message: { text: aiMessage}
     }
   }, (error, response) => {
     if(error) {
       console.log("Something went wrongs!");
     }else if(response.body.error) {
       console.log('Error: ', response.body.error);
     }
   })

  });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();

}

app.listen(app.get('port'), function() {
  console.log("Running on port: ", app.get("port"));
});
