# learning to use moonlink.js
Hello world, I am Lucas, one of the developers of this package, I will teach you step by step how to use the package "moonlink.js"

## first step
To start using the package, first we need a support library to use the package, I will use "discord.js"

installation using npmjs
```js
npm install discord.js
```
installation using yarn
```js
yarn add discord.js
```
### Creating a bot client
Well, each developer has their way of programming, so do it the way you know how so you don't complicate your life later. 
Let's create a client
#### COMMONJS
```js
let Discord = require('discord.js')
let client = new Discord.Client(/*config*/)
client.login('Create an application, and create a bot and put the token here')
```
#### ECMASCRIPT
```js
import Discord from 'discord.js'
let client = new Discord.Client(/*config*/)
client.login('Create an application, and create a bot and put the token here')
```
### Installing moonlink.js and configuring 
Now let's install the music pack
Installing using npmjs
```js
npm install moonlink.js
```
Installing using yarn
```js
yarn add moonlink.js
```
