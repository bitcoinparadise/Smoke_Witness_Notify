# Smoke Witness Notify - Discord Bot

Discord bot to notify Smoke Witness of missed blocks.

Requires [Node.js](https://github.com/nodejs/node) libraries and a Discord bot account.

The instructions will install the notification bot and [Smoke-js](https://github.com/smokenetwork/) libariries.

* First create a Discord bot account, get the bot token for later and continue with the installation.

Guide on how to create a Discord bot https://discordpy.readthedocs.io/en/rewrite/discord.html

## Installation

```
$ git clone https://github.com/bitcoinparadise/Smoke_Witness_Notify
$ cd Smoke_Witness_Notify
$ npm install 
$ cd node_modules
$ git clone https://github.com/smokenetwork/smoke-js.git
$ cd smoke-js
$ npm install
$ cd ~/Smoke_Witness_Notify
```

## Configuration
First rename config-example.json to config.json:

```
$ mv config-example.json config.json
```

Then set the following options in config.json:
```
{
  "rpc_nodes": [
    "https://rpc.smoke.io",  // Set the list of RPC nodes you would like to connect to (https://rpc.smoke.io is the default if this is not set). The software will automatically fail over to the next node on the list if the current one is having issues.
    "ADDITIONA_NODE_URL"
  ],
  "accountname": "USERNAME",
  "discorduser": "DISCORD_USER_ID",
  "token": "BOT_TOKEN",
}
```

## Run

```
node witness_notify.js
```
<br>

Based on @markptrueman's [witness_monitor_tutorial](https://github.com/markptrueman/witness_monitor_tutorial)
