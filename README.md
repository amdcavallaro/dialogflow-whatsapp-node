# Connect a Dialogflow Chatbot to WhatsApp using Node.js and the Messages API

This demo allows you create a WhatsApp chatbot integrated with Dialogflow Essentials using the Vonage Messages API and Node.js. To use it, first go to your [Vonage Developer](https://dashboard.nexmo.com/) dashboard and configure your [WhatsApp sandbox](https://dashboard.nexmo.com/messages/sandbox).

Clone this repository to a new directory on your machine and:

1. Run `npm install` to install the dependencies.
2. Copy the `.env.example` and create your own `.env` file and populate it with your credentials.
3. Create a Dialogflow Agent.
4. Perform the [Google Cloud Setup](https://cloud.google.com/dialogflow/es/docs/quick/setup).
5. Run `node chatbot.js` to send a test message.

# Credits
[Detect Intent from the QuickStart: Interactions with API](https://cloud.google.com/dialogflow/es/docs/quick/api).