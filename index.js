const { App } = require("@slack/bolt");

const translate = require('@vitalets/google-translate-api');

require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode:true, // enable the following to use socket mode
    appToken: process.env.SLACK_APP_TOKEN,
  });

// Listener middleware that filters out messages with 'bot_message' subtype
    async function noBotMessages({ message, next }) {
        if (!message.bot_profile) {
            // const text = message.text
            // const test = text.replace(/ *\:[^)]*\: */g, "")
            // console.log(test)
            await next();
        }
    }

  // The listener only receives messages from humans

  app.message(noBotMessages, async ({ client, logger, message }) => {
    try {
        client.chat.postMessage({
            channel: message.channel,
            text: (await translate(message.text.replace(/\@.*$/, ""), {to: 'ja'})).text,
            thread_ts: message.ts
        })
        //.replace(/ *\:[^)]*\: */g, "")
      }
      catch (error) {
        logger.error(error);
      }
  });

  app.command("/heybot", async ({
    command,
    ack
  }) => {
    await ack()
    await app.client.conversations.join({
        token: process.env.SLACK_BOT_TOKEN,
        channel: command.channel_id, 
    });
    app.client.chat.postMessage({
        channel: command.channel_id,
        text: "I'm here to help you translate your messages",
    })
  });

  app.command("/byebot", async ({
    command,
    ack
  }) => {
    app.client.chat.postMessage({
        channel: command.channel_id,
        text: "See you! I'm left",
    })
    await ack()
    await app.client.conversations.leave({
        token: process.env.SLACK_BOT_TOKEN,
        channel: command.channel_id,
    });
  });

  app.command("/addlang", async ({
    command,
    ack
  }) => {
    app.lang = `${command.text}`
    await ack()
    await app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Trasnlate to "+app.lang,
    })
  });

  app.command("/byelang", async ({
    command,
    ack
  }) => {
    app.lang = 'en'
    await ack()
    await app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Trasnlate to en",
    })
  });

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();