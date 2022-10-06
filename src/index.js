require("dotenv").config();

const { App } = require("@slack/bolt");

const database =require('./database/connect')

const Controller = require('./controller/record')

const db = new database();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true,
  appToken: process.env.SLACK_APP_TOKEN,
});

async function noBotMessages({ message, next }) {
  if (!message.bot_profile && !message.sub_type && message.channel_type == "channel") {
    await next();
  }
}

app.use(async ({ payload , next }) => {
  const channelList = await app.client.conversations.list({
    token: process.env.SLACK_BOT_TOKEN,
    types: 'public_channel'
  })

  await Promise.all(channelList.channels?.map(async ({id}) => {
    if (payload.channel_id == id || payload.channel == id) return next();
  }));
})

app.message(noBotMessages, async({client, message}) => {Controller.handleMessage(client, message)});

app.command("/heybot",async({client, command, ack}) => {Controller.handleHeybot(client, command, ack)});

app.command("/byebot",async({client, command, ack}) => {Controller.handleByebot(client, command, ack)});

app.command("/findlang",async({client, command, ack }) => {Controller.handleFindlang(client, command, ack)});

app.command("/addlang", async ({client, command, ack }) => {Controller.handleAddlang(client, command, ack)});

app.command("/byelang", async ({client, command, ack}) => {Controller.handleByelang(client, command, ack)});

app.command("/listlang", async ({client, command, ack }) => {Controller.handleListlang(client, command, ack)});

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();