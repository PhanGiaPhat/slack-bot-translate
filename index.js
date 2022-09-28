const { App } = require("@slack/bolt");

const translate = require('@vitalets/google-translate-api');

require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode:true, // enable the following to use socket mode
    appToken: process.env.SLACK_APP_TOKEN
  });

// Listener middleware that filters out messages with 'bot_message' subtype
    async function noBotMessages({ message, next }) {
        if (!message.subtype || message.subtype !== 'bot_message') {
        await next();
        }
    }

  // The listener only receives messages from humans
  app.message(noBotMessages, async ({ client, logger, message }) => {
    try {
        client.chat.postMessage({
            channel: message.channel,
            text: (await translate(message.text, {to: 'en'})).text,
            as_user: true,
        })
      }
      catch (error) {
        logger.error(error);
      }
  });

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();