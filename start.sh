#!/bin/bash
readonly SLACK_BOT_TOKEN=xoxb-810419405043-4124002799878-sMECWryxwNqrxmzwdFvbQGn6
readonly SLACK_APP_TOKEN=xapp-1-A043UJ51FB4-4169863070371-5985c178b9577cd36149b18c242bd4dc8d17658f3a58f0fd2a0f4ca0822f16a2
readonly SLACK_SIGNING_SECRET=ea5ce3685a280fbcb5bd4591a64bf237

if uname -r | grep -q "Microsoft"
then
    set SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN
    set SLACK_APP_TOKEN=$SLACK_APP_TOKEN
    set SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET
    docker-compose up
else
    export SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN
    export SLACK_APP_TOKEN=$SLACK_APP_TOKEN
    export SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET
    docker-compose up
fi