// Import Express.js
const express = require('express');
const axios = require('axios');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;

// what app settings
const version = process.env.API_VERSION || 'v22.0';
const verifyToken = process.env.VERIFY_TOKEN;

// send message using whats app template
async function sendWhatsAppTemplateMessage(recipientNumber, templateName, templateComponents, accessToken, phoneNumberId) {
  const data = {
    messaging_product: 'whatsapp',
    to: recipientNumber,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en', // Or your template's language code
        policy: 'deterministic'
      },
      components: templateComponents // Array of objects defining header, body, or button parameters
    }
  };

  const config = {
    method: 'post',
    url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`, // Adjust version as needed
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)
  };

  try {
    const response = await axios(config);
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}



// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

app.get('/status', (req, res) => {
    res.status(200).send('OK');
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});


// Route for POST requests
app.get('/message', (req, res) => {

const { 'apikey': apikey, 'from': from, 'templateid': templateid, 'type' : type, 'to' : to, 'placeholders' : placeholders } = req.query;

//let msg = JSON.parse(req.query);

const recipient = to;
const template = templateid;
const token = apikey;
const phoneId = from;

let msgPlaceholders = placeholders.split('|~|');
let templateComponents = msgPlaceholders.map((item) => { return {"type": "text", "text" : item}; });

const components = [
  {
    type: 'body',
    parameters: templateComponents
  }
];


sendWhatsAppTemplateMessage(recipient, template, components, token, phoneId);

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nGet - Message Sent ${timestamp}\n`);
  console.log(req.query);
  res.status(200).end();
});

// Route for POST requests
app.post('/message', (req, res) => {

let msg = req.body;

const recipient = msg.to;
const template = msg.templateid;
const token = msg.apikey;
const phoneId = msg.from;

let msgPlaceholders = msg.placeholders.split('|~|');
let templateComponents = msgPlaceholders.map((item) => { return {"type": "text", "text" : item}; });

const components = [
  {
    type: 'body',
    parameters: templateComponents
  }
];


sendWhatsAppTemplateMessage(recipient, template, components, token, phoneId);

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nPost - Message Sent ${timestamp}\n`);
  console.log(JSON.stringify(components, null, 2));
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
