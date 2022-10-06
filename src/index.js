require("dotenv").config();

const { App } = require("@slack/bolt");

const translate = require('@vitalets/google-translate-api');

const mongoose = require('mongoose');

const mongodb_url = process.env.MONGODB_URL;

const langUtils = require('./utils/language');

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(mongodb_url, {useNewUrlParser: true})
            .then(() => {
                console.log("Database connection successfully!");
            })
            .catch(err => {
                console.log("Database connection error!");
            })
    }
}

const Databse = new Database();

var recordSchema = mongoose.Schema({
    channel: {
        type: String,
        default: ''
    },
    language: {
        type: Array,
        default: ''
    }
});

const Record = mongoose.model('record', recordSchema, 'record');

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

app.message(noBotMessages, async ({ client, message }) => {
  const clientText  = message.text.replace(/:\S*:|<\S*>/gim, "") || "";
  const records = await Record.findOne({ channel: message?.channel });
  const translatedTexts = await Promise.all(records.language?.map(async ({ key }) => {
    return (await translate(clientText, { to: key }))?.text;
  }));
  const responseText = translatedTexts?.join("\n");
  const userInfo = await client.users.info({
    token: process.env.SLACK_BOT_TOKEN,
    user: message.user
  })
  await client.chat.postMessage({
    channel: message.channel,
    text: responseText,
    username: userInfo?.user?.profile?.display_name
  });
});

app.command("/heybot", async ({
  command,
  ack
}) => {
  await ack()
  Record.countDocuments({channel: command.channel_id}, function (err, count){ 
    if(count>0){
      app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "I'm exist !!!",
          }]
      })
    } else {
      let newRecord = new Record({
        channel: command.channel_id,
        language: [
          {
            key: "en"
          }
        ]
      });
      newRecord.save()
        .then()
        .catch()
      app.client.conversations.join({
          token: process.env.SLACK_BOT_TOKEN,
          channel: command.channel_id, 
      });
      app.client.chat.postMessage({
          channel: command.channel_id,
          text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "I'm here to help you translate your messages",
          }]
      })
    }
  }); 
});

app.command("/byebot", async ({
  command,
  ack
}) => {
  await ack()
  Record.countDocuments({channel: command.channel_id}, function (err, count){ 
    if(count>0){
      Record.deleteMany({ channel: { $in: command.channel_id}}, function(err) {})
      app.client.chat.postMessage({
          channel: command.channel_id,
          text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "See you! I'm left",
          }]
      })
      app.client.conversations.leave({
          token: process.env.SLACK_BOT_TOKEN,
          channel: command.channel_id,
      });
    } else {
      app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Here's your all",
        attachments: [{
          "color": "#33ccee",
          "text" : "Not in channel to leave !!!",
        }]
      })
    }
  });
});

app.command("/findlang", async({
  command,
  ack
}) => {
  await ack()
  await app.client.chat.postMessage({
    channel: command.channel_id,
    text: "Here's your all",
    attachments: [{
      "color": "#33ccee",
      "text" : "```\n" + langUtils.langToShow(langUtils.langs) + "\n```",
    }]
  })
});

app.command("/addlang", async ({
  command,
  ack
}) => {
  await ack()
  if (langUtils.isSupported(command.text)){
    Record.findOneAndUpdate({ channel: ""+command.channel_id}, { $push: { language : {key : ""+command.text} } },
    function(err) {
      if (err) {
        console.log(err)
      }
    });

    const records = await Record.findOne({channel : command.channel_id});

    app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Here's your all",
        attachments: [{
          "color": "#33ccee",
          "text" : "Added language: "+command.text+"\n"+"Language list: "+langUtils.getLangList(records.language),
        }]
    })
  } else {
    app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "Not support this language, please use /findlang to find the correct code !!!",
      }]
    })
  }
});

app.command("/byelang", async ({
  command,
  ack
}) => {
  await ack()

  if (langUtils.isSupported(command.text)){
    Record.findOneAndUpdate({ channel: ""+command.channel_id}, { $pull: { language : {key : ""+command.text} } },
    function(err) {
      if (err) {
        console.log(err)
      }
    });

    const records = await Record.findOne({channel : command.channel_id})
    
    app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "Removed language: "+command.text+"\n"+"Language list: "+ langUtils.getLangList(records.language),
      }]
    })
  } else {
    app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "Not support this language, please use /findlang to find the correct code !!!",
      }]
    })
  }
});

app.command("/listlang", async ({
  command,
  ack
}) => {
  await ack()

  const records = await Record.findOne({channel : command.channel_id});

  await app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "Language list: "+langUtils.getLangList(records.language),
      }]
  })
});

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();