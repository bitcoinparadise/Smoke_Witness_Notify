# Smoke Witness Notify - Discord Bot

Requires [Smoke-js](https://github.com/smokenetwork/) libraries.

## Installation

```
$ git clone https://github.com/bitcoinparadise/Smoke_Witness_Notify_Discord
$ cd Smoke_Witness_Notify_Discord
$ npm install 
$ npm audit fix
```

### Install Smoke-js

```
$ cd ~/Smoke_Witness_Notify_Discord/node_modules/
$ git clone https://github.com/smokenetwork/smoke-js.git
$ cd smoke-js
$ npm install
$ npm audit fix
$ cd ~/Smoke_Witness_Notify_Discord
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
nodejs witness_notify.js
```
