const { App } = require("@slack/bolt");


const app = new App({
    token: "xoxb-810419405043-4124002799878-955spagPL9SZZxxPtECezCmZ", //Find in the Oauth  & Permissions tab
    signingSecret: "ea5ce3685a280fbcb5bd4591a64bf237", // Find in Basic Information Tab
    socketMode:true,
    appToken: "xapp-1-A043UJ51FB4-4140271409252-042a8e7a0bbb1908c12c0bcc9e24fde811d0df9cf85a19c604b4e654b5243e72" // Token from the App-level Token that we created
});

app.command("/square", async ({ command, ack, say }) => {
try {
    await ack();
    let txt = command.text // The inputted parameters
    if(isNaN(txt)) {
        say(txt + " is not a number")
    } else {
        say(txt + " squared = " + (parseFloat(txt) * parseFloat(txt)))
    }
} catch (error) {
    console.log("err")
    console.error(error);
}
});

app.message("hello", async ({ command, say }) => { // Replace hello with the message
    try {
    say("Hi! Thanks for PM'ing me!");
    } catch (error) {
        console.log("err")
    console.error(error);
    }
});


app.start(3000)