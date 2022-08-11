# starting
Hello world, I'm Lucas one of the developers and I'm going to help you how to make a music command in your bot, all this information will be on the official website of moonlink.js
## What is necessary
First of all you need to make connection from package to lavalink, and from bot to package, all this is in previous documentation
[Starting]()
## Let's start 
First of all let's start the package using your bot's ready event, so when bot starts the package it starts working
```js
client.on('ready', async() => client.moon.init(client.user.id))
```
Now let's start creating the command
In messageCreate
```js 
client.on('messageCreate', async(message) => {
 
 })
