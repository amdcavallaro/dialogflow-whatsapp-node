require('dotenv').config();

const Vonage = require('@vonage/server-sdk');
const dialogflow = require('@google-cloud/dialogflow');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = Math.random().toString(36).substr(2, 9);
const languageCode = 'pt';

const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

const vonage = new Vonage(
  {
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_APPLICATION_PRIVATE_KEY_PATH,
  },
  {
    apiHost: `https://messages-sandbox.nexmo.com/`,
  }
);

// Receives the user input
app.post('/inbound', function (req, res) {
  let messageSentByTheUser = req.body.message.content.text;

  let query = messageSentByTheUser;

  let request = require('request');

  let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
  ) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
  }

  async function executeQueries(projectId, sessionId, query, languageCode) {
    let context;
    let intentResponse;
    try {
      console.log(`Sending Query: ${query}`);
      intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode
      );
      console.log('Detected intent');
      console.log(
        `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
      );
      let dataString = `{ "from": { "type": "whatsapp", "number": "${process.env.WHATSAPP_NUMBER}" }, "to": { "type": "whatsapp", "number": "${process.env.TO_NUMBER}" }, "message": { "content": { "type": "text", "text": "${intentResponse.queryResult.fulfillmentText}" } } }`;

      let options = {
        url: 'https://messages-sandbox.nexmo.com/v0.1/messages',
        method: 'POST',
        headers: headers,
        body: dataString,
        auth: {
          user: process.env.VONAGE_API_KEY,
          pass: process.env.VONAGE_API_SECRET,
        },
      };

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
        }
      }

      request(options, callback);

      // Use the context from this response for next queries
      context = intentResponse.queryResult.outputContexts;
    } catch (error) {
      console.log(error);
    }
  }
  executeQueries(projectId, sessionId, query, languageCode);

  res.status(204).end();
});

// This endpoint receives information about events in the app
app.post('/status', function (req, res) {
  res.status(204).end();
});

// Listens for requests
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
