require("dotenv").config();

const Model =require('../model/record')

const langUtils = require('../utils/language');

const translate = require('@vitalets/google-translate-api');

async function handleMessage(client, message){
  const clientText  = message.text.replace(/:\S*:|<\S*>/gim, "") || "";
  const records = await Model.Record.findOne({ channel: message?.channel });
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
}

async function handleHeybot(client, command, ack){
    await ack()
  Model.Record.countDocuments({channel: command.channel_id}, function (err, count){ 
    if(count>0){
      client.chat.postMessage({
        channel: command.channel_id,
        text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "I'm exist !!!",
          }]
      })
    } else {
      let newRecord = new Model.Record({
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
      client.conversations.join({
          token: process.env.SLACK_BOT_TOKEN,
          channel: command.channel_id, 
      });
      client.chat.postMessage({
          channel: command.channel_id,
          text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "I'm here to help you translate your messages",
          }]
      })
    }
  }); 
}

async function handleByebot(client, command, ack){
    await ack()
    Model.Record.countDocuments({channel: command.channel_id}, function (err, count){ 
      if(count>0){
        Model.Record.deleteMany({ channel: { $in: command.channel_id}}, function(err) {})
        client.chat.postMessage({
            channel: command.channel_id,
            text: "Here's your all",
            attachments: [{
              "color": "#33ccee",
              "text" : "See you! I'm left",
            }]
        })
        client.conversations.leave({
            token: process.env.SLACK_BOT_TOKEN,
            channel: command.channel_id,
        });
      } else {
        client.chat.postMessage({
          channel: command.channel_id,
          text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "Not in channel to leave !!!",
          }]
        })
      }
    });
}

async function handleFindlang(client, command, ack) {
    await ack()
    await client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "```\n" + langUtils.langToShow(langUtils.langs) + "\n```",
      }]
    })
}

async function handleAddlang(client, command, ack) {
    await ack()
    if (langUtils.isSupported(command.text)){
      Model.Record.findOneAndUpdate({ channel: ""+command.channel_id}, { $push: { language : {key : ""+command.text} } },
      function(err) {
        if (err) {
          console.log(err)
        }
      });
  
      const records = await Model.Record.findOne({channel : command.channel_id});
  
          client.chat.postMessage({
          channel: command.channel_id,
          text: "Here's your all",
          attachments: [{
            "color": "#33ccee",
            "text" : "Added language: "+command.text+"\n"+"Language list: "+langUtils.getLangList(records.language),
          }]
      })
    } else {
        client.chat.postMessage({
        channel: command.channel_id,
        text: "Here's your all",
        attachments: [{
          "color": "#33ccee",
          "text" : "Not support this language, please use /findlang to find the correct code !!!",
        }]
      })
    }
}

async function handleByelang(client, command,ack) {
    await ack()

  if (langUtils.isSupported(command.text)){
    Model.Record.findOneAndUpdate({ channel: ""+command.channel_id}, { $pull: { language : {key : ""+command.text} } },
    function(err) {
      if (err) {
        console.log(err)
      }
    });

    const records = await Model.Record.findOne({channel : command.channel_id})
    
    client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "Removed language: "+command.text+"\n"+"Language list: "+ langUtils.getLangList(records.language),
      }]
    })
  } else {
    client.chat.postMessage({
      channel: command.channel_id,
      text: "Here's your all",
      attachments: [{
        "color": "#33ccee",
        "text" : "Not support this language, please use /findlang to find the correct code !!!",
      }]
    })
  }
}

async function handleListlang(client, command, ack) {
    await ack()

    const records = await Model.Record.findOne({channel : command.channel_id});
  
    await client.chat.postMessage({
        channel: command.channel_id,
        text: "Here's your all",
        attachments: [{
          "color": "#33ccee",
          "text" : "Language list: "+langUtils.getLangList(records.language),
        }]
    })
}

module.exports = {
    handleMessage: handleMessage,
    handleHeybot: handleHeybot,
    handleByebot: handleByebot,
    handleFindlang: handleFindlang,
    handleAddlang: handleAddlang,
    handleByelang: handleByelang,
    handleListlang: handleListlang
}
