const { App } = require("@slack/bolt");

const translate = require('@vitalets/google-translate-api');

let mongoose = require('mongoose');

const mongodb_url = 'mongodb+srv://transwitcher:0Dwb5VAUiuirxvj5@cluster0.iirfnkv.mongodb.net/?retryWrites=true&w=majority'

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

require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true,
  appToken: process.env.SLACK_APP_TOKEN,
});

async function noBotMessages({ message, next }) {
    if (!message.bot_profile) {
        await next();
    }
}
  
var getLangList = function(arrLang) {
  var result = "";
  arrLang.map(async ({key}) => {
    result += key+" ";
  })
  return result;
}

app.message(noBotMessages, async ({ client, logger, message }) => {
  try {

      const records = await Record.findOne({channel : message.channel});

      var texts = await Promise.all(records.language.map(async ({key}) => {
        return (await translate(message.text, {to: key})).text;
      }))
      client.chat.postMessage({
          channel: message.channel,
          text: texts.join('\n'),
          thread_ts: message.ts
      })
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
  Record.countDocuments({channel: command.channel_id}, function (err, count){ 
    if(count>0){
      app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Exist !!!",
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
          text: "I'm here to help you translate your messages",
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
          text: "See you! I'm left",
      })
      app.client.conversations.leave({
          token: process.env.SLACK_BOT_TOKEN,
          channel: command.channel_id,
      });
    } else {
      app.client.chat.postMessage({
        channel: command.channel_id,
        text: "Not in channel to leave !!!",
      })
    }
  });
});

app.command("/addlang", async ({
  command,
  ack
}) => {
  await ack()
  Record.findOneAndUpdate({ channel: ""+command.channel_id}, { $push: { language : {key : ""+command.text} } },
  function(err) {
    if (err) {
      console.log(err)
    }
  });

  const records = await Record.findOne({channel : command.channel_id});

  await app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Added language: "+command.text+"\n"+"Language list: "+getLangList(records.language),
  })
});

app.command("/byelang", async ({
  command,
  ack
}) => {
  await ack()
  Record.findOneAndUpdate({ channel: ""+command.channel_id}, { $pull: { language : {key : ""+command.text} } },
  function(err) {
    if (err) {
      console.log(err)
    }
  });

  const records = await Record.findOne({channel : command.channel_id});

  await app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Removed language: "+command.text+"\n"+"Language list: "+getLangList(records.language),
  })
});

  

app.command("/listlang", async ({
  command,
  ack
}) => {
  await ack()

  const records = await Record.findOne({channel : command.channel_id});

  await app.client.chat.postMessage({
      channel: command.channel_id,
      text: "Language list: "+getLangList(records.language),
  })
});

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();