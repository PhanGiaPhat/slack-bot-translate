# Slack Bot Translate
<div style="text-align: center;">
    <img src="/Witcher.jpg" height="200" alt="OVEN TransWitcher" />
</div>


Slack bot that translates language with Slack Bolt, Google Translate API, MongoDB.

### Toolkit
* [Slack Bolt JS](https://github.com/slackapi/bolt-js) For serverless functions as backend
* [google-translate-api](https://www.npmjs.com/package/@vitalets/google-translate-api) A free and unlimited API for Google Translate 💵 🚫 for Node.js.
* [MongDB](https://www.mongodb.com/) For storage channel ID and the languages list 
### Usage

```
git clone https://github.com/PhanGiaPhat/slack-bot-translate.git
npm install
```

#### Create a `.env` file, with keys for: 
- Slack tokens - sign up for Slack, "Add a Bot User" to create your bot, and go to the Basic Information panel to find:
  - `SLACK_BOT_TOKEN`
  - `SLACK_SIGNING_SECRET`
  - `SLACK_APP_TOKEN`

#### Add the bot to the Slack Workspace:
- enable Slash Commands (see [minute 6 of this tutorial](https://medium.com/slack-developer-blog/build-a-serverless-slack-bot-in-9-minutes-with-node-js-and-stdlib-b993cfa15358))
- modify `SLACK_BOT_TOKEN` from Your Slack App Dashboard -> Install App -> Bot User OAuth Token
- modify `SLACK_SIGNING_SECRET` from Your Slack App Dashboard -> Basic information -> App Credentials -> Client Secret
- modify `SLACK_APP_TOKEN` from Your Slack App Dashboard -> Basic information -> App-Level Tokens -> Tokens

#### Add the bot to the Slack Workspace:
- Go to your Dashboard -> OAuth & Permissions :
    - channels:history
    - channels:join
    - channels:manage
    - channels:read
    - chat:write
    - chat:write.customize
    - chat:write.public
    - commands
    - emoji:read
    - groups:history
    - groups:write
    - im:history
    - im:write
    - incoming-webhook
    - mpim:history
    - mpim:write
    - users.profile:read
    - users:read


- Go to your Dashboard -> Event Subscriptions -> Subscribe to bot events:
    - message.channels
    - message.groups
    - message.im
    - message.mpim


#### Add MongoDB URL in index.js file
- find `mongodb_url` variable in index.js file and replace with your `username` and `password`


#### Test it out
- type `/heybot` in a slack public channel to invite bot to channel.
- type `/byebot` in a public channel that Bot was invited to remove him.
- type `/addlang` in a public channel that Bot was invited with `2 digit ISO language code` to add language.
    - Example: `/addlang en` for add English to translate languages list.
    - Example: `/addlang ja` for add Japanese to translate languages list.
    - Example: `/addlang vi` for add Vietnamese to translate languages list.
- type `/byelang` in a public channel that Bot was invited with `2 digit ISO language code` to remove language.
    - Example: `/byelang en` for remove English to translate languages list.
    - Example: `/byelang ja` for remove Japanese to translate languages list.
    - Example: `/byelang vi` for remove Vietnamese to translate languages list.
- type `/listlang` in a public channel that Bot was invited to show current languages list.
- type `/findlang` in a public channel that Bot was invited to show supported language list to translate.
### Development

```
// install packages
npm install 
```

To check if this is working, run:
```
// run bot on your local with nodemon
npm start 

// run bot on production with pm2
pm2 start index.js --watch 
```

Reference tutorial: https://medium.com/slack-developer-blog/build-a-serverless-slack-bot-in-9-minutes-with-node-js-and-stdlib-b993cfa15358