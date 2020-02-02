# Upvote Police Discord Bot

Do you have a friend who upvotes themselves shamelessly? Remind them everytime they decide to do it with this simple bot. 

## Libraries  
- Nodejs
- Express
- Mongodb
- Discord.js

On clone run `npm install` to install the necessary packages from the `package.json` file.

## Configuration

### Auth Config (`auth.json`)

Firstly, copy and paste an extra copy of the `auth.json.default` file into the repo directory and rename it to `auth.json`.

Modify the `token` field to contain the token of your discord bot. 

### Applciation Config

Do the same thing you did with the `auth.json.default` file to the `config.json.default` file. The config values and their descriptions can be found below.

- `toWatch` = the id of the custom emoji to watch  
- `messages` = messages the bot will respond with when a self upvote is encountered  
- `uri` = the uri mongo provides for your database, if you need some free hosting I recommend mlab atlas  

