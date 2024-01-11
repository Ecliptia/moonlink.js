[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkPlayer

# Class: MoonlinkPlayer

## Table of contents

### Constructors

- [constructor](MoonlinkPlayer.md#constructor)

### Properties

- [autoLeave](MoonlinkPlayer.md#autoleave)
- [autoPlay](MoonlinkPlayer.md#autoplay)
- [connected](MoonlinkPlayer.md#connected)
- [current](MoonlinkPlayer.md#current)
- [data](MoonlinkPlayer.md#data)
- [guildId](MoonlinkPlayer.md#guildid)
- [infos](MoonlinkPlayer.md#infos)
- [loop](MoonlinkPlayer.md#loop)
- [manager](MoonlinkPlayer.md#manager)
- [map](MoonlinkPlayer.md#map)
- [node](MoonlinkPlayer.md#node)
- [paused](MoonlinkPlayer.md#paused)
- [ping](MoonlinkPlayer.md#ping)
- [playing](MoonlinkPlayer.md#playing)
- [previous](MoonlinkPlayer.md#previous)
- [queue](MoonlinkPlayer.md#queue)
- [rest](MoonlinkPlayer.md#rest)
- [shuffled](MoonlinkPlayer.md#shuffled)
- [textChannel](MoonlinkPlayer.md#textchannel)
- [voiceChannel](MoonlinkPlayer.md#voicechannel)
- [volume](MoonlinkPlayer.md#volume)

### Methods

- [connect](MoonlinkPlayer.md#connect)
- [destroy](MoonlinkPlayer.md#destroy)
- [disconnect](MoonlinkPlayer.md#disconnect)
- [get](MoonlinkPlayer.md#get)
- [pause](MoonlinkPlayer.md#pause)
- [play](MoonlinkPlayer.md#play)
- [restart](MoonlinkPlayer.md#restart)
- [resume](MoonlinkPlayer.md#resume)
- [seek](MoonlinkPlayer.md#seek)
- [set](MoonlinkPlayer.md#set)
- [setAutoLeave](MoonlinkPlayer.md#setautoleave)
- [setAutoPlay](MoonlinkPlayer.md#setautoplay)
- [setLoop](MoonlinkPlayer.md#setloop)
- [setTextChannel](MoonlinkPlayer.md#settextchannel)
- [setVoiceChannel](MoonlinkPlayer.md#setvoicechannel)
- [setVolume](MoonlinkPlayer.md#setvolume)
- [shuffle](MoonlinkPlayer.md#shuffle)
- [skip](MoonlinkPlayer.md#skip)
- [skipTo](MoonlinkPlayer.md#skipto)
- [stop](MoonlinkPlayer.md#stop)
- [updatePlaybackStatus](MoonlinkPlayer.md#updateplaybackstatus)
- [updatePlayers](MoonlinkPlayer.md#updateplayers)
- [validateNumberParam](MoonlinkPlayer.md#validatenumberparam)

## Constructors

### constructor

• **new MoonlinkPlayer**(`infos`, `manager`, `map`): [`MoonlinkPlayer`](MoonlinkPlayer.md)

Creates an instance of MoonlinkPlayer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `infos` | [`PlayerInfos`](../interfaces/PlayerInfos.md) | Player information. |
| `manager` | [`MoonlinkManager`](MoonlinkManager.md) | MoonlinkManager instance. |
| `map` | `Map`\<`string`, `any`\> | Map for storing player data. |

#### Returns

[`MoonlinkPlayer`](MoonlinkPlayer.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:38](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L38)

## Properties

### autoLeave

• **autoLeave**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:17](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L17)

___

### autoPlay

• **autoPlay**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:16](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L16)

___

### connected

• **connected**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:18](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L18)

___

### current

• **current**: `Record`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:26](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L26)

___

### data

• **data**: `Record`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:28](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L28)

___

### guildId

• **guildId**: `string`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:13](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L13)

___

### infos

• `Private` **infos**: [`PlayerInfos`](../interfaces/PlayerInfos.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:11](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L11)

___

### loop

• **loop**: `number`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:21](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L21)

___

### manager

• **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:10](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L10)

___

### map

• `Private` **map**: `Map`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:12](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L12)

___

### node

• **node**: `any`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:29](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L29)

___

### paused

• **paused**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:20](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L20)

___

### ping

• **ping**: `number`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:24](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L24)

___

### playing

• **playing**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:19](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L19)

___

### previous

• **previous**: `Record`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:27](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L27)

___

### queue

• **queue**: [`MoonlinkQueue`](MoonlinkQueue.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:25](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L25)

___

### rest

• **rest**: [`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:30](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L30)

___

### shuffled

• **shuffled**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:23](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L23)

___

### textChannel

• **textChannel**: `string`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:14](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L14)

___

### voiceChannel

• **voiceChannel**: `string`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:15](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L15)

___

### volume

• **volume**: `number`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:22](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L22)

## Methods

### connect

▸ **connect**(`options`): `boolean`

Connect the player to a voice channel with optional connection options.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`connectOptions`](../interfaces/connectOptions.md) | Connection options (setMute, setDeaf). |

#### Returns

`boolean`

True if the connection was successful.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:206](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L206)

___

### destroy

▸ **destroy**(): `Promise`\<`boolean`\>

Destroy the player, disconnecting it and removing player data.

#### Returns

`Promise`\<`boolean`\>

True if the player was successfully destroyed.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:437](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L437)

___

### disconnect

▸ **disconnect**(): `boolean`

Disconnect the player from the voice channel.

#### Returns

`boolean`

True if the disconnection was successful.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:229](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L229)

___

### get

▸ **get**\<`T`\>(`key`): `T`

Get a value from the player's data.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to retrieve. |

#### Returns

`T`

The value associated with the key.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:124](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L124)

___

### pause

▸ **pause**(): `Promise`\<`boolean`\>

Pause the playback.

#### Returns

`Promise`\<`boolean`\>

True if paused successfully.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:312](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L312)

___

### play

▸ **play**(): `Promise`\<`void`\>

Play the next track in the queue.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:267](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L267)

___

### restart

▸ **restart**(): `Promise`\<`void`\>

Restart the player by reconnecting and updating its state.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:250](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L250)

___

### resume

▸ **resume**(): `Promise`\<`boolean`\>

Resume the playback.

#### Returns

`Promise`\<`boolean`\>

True if resumed successfully.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:322](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L322)

___

### seek

▸ **seek**(`position`): `Promise`\<`number`\>

Seek to a specific position in the current track.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `number` | The position to seek to. |

#### Returns

`Promise`\<`number`\>

The new position after seeking.

**`Throws`**

Error if the position is greater than the track duration or seek is not allowed.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:467](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L467)

___

### set

▸ **set**(`key`, `value`): `void`

Set a key-value pair in the player's data and update the map.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The key to set. |
| `value` | `unknown` | The value to set. |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:114](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L114)

___

### setAutoLeave

▸ **setAutoLeave**(`mode?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode?` | `boolean` |

#### Returns

`boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:173](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L173)

___

### setAutoPlay

▸ **setAutoPlay**(`mode`): `boolean`

Set the auto-play mode for the player.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mode` | `boolean` | Auto-play mode (true/false). |

#### Returns

`boolean`

True if the mode was set successfully.

**`Throws`**

Error if mode is not a boolean.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:190](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L190)

___

### setLoop

▸ **setLoop**(`mode`): `number`

Set the loop mode for the player.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mode` | `number` | Loop mode (0 for no loop, 1 for single track, 2 for entire queue). |

#### Returns

`number`

The new loop mode.

**`Throws`**

Error if the mode is not a valid number or out of range.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:419](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L419)

___

### setTextChannel

▸ **setTextChannel**(`channelId`): `boolean`

Set the text channel for the player.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `channelId` | `string` | The ID of the text channel. |

#### Returns

`boolean`

True if the channel was set successfully.

**`Throws`**

Error if channelId is empty or not a string.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:135](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L135)

___

### setVoiceChannel

▸ **setVoiceChannel**(`channelId`): `boolean`

Set the voice channel for the player.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `channelId` | `string` | The ID of the voice channel. |

#### Returns

`boolean`

True if the channel was set successfully.

**`Throws`**

Error if channelId is empty or not a string.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:157](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L157)

___

### setVolume

▸ **setVolume**(`percent`): `Promise`\<`number`\>

Set the volume level for the player.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `percent` | `number` | Volume percentage (0 to Infinity). |

#### Returns

`Promise`\<`number`\>

The new volume level.

**`Throws`**

Error if the volume is not a valid number or player is not playing.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:393](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L393)

___

### shuffle

▸ **shuffle**(`mode?`): `boolean`

Shuffle the tracks in the queue.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode?` | `boolean` |

#### Returns

`boolean`

True if the shuffle was successful.

**`Throws`**

Error if the queue is empty.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:534](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L534)

___

### skip

▸ **skip**(): `Promise`\<`boolean`\>

Skip to the next track in the queue.

#### Returns

`Promise`\<`boolean`\>

True if the next track was successfully played.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:360](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L360)

___

### skipTo

▸ **skipTo**(`position`): `Promise`\<`boolean` \| `void`\>

Skip to a specific position in the queue.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `number` | The position to skip to. |

#### Returns

`Promise`\<`boolean` \| `void`\>

True if the position exists and the skip was successful.

**`Throws`**

Error if the queue is empty, or the indicated position does not exist.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:496](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L496)

___

### stop

▸ **stop**(`destroy?`): `Promise`\<`boolean`\>

Stop the playback and optionally clear player data.

#### Parameters

| Name | Type |
| :------ | :------ |
| `destroy?` | `boolean` |

#### Returns

`Promise`\<`boolean`\>

True if stopped successfully.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:345](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L345)

___

### updatePlaybackStatus

▸ **updatePlaybackStatus**(`paused`): `Promise`\<`void`\>

Private method to update the playback status (paused or resumed).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `paused` | `boolean` | Indicates whether to pause or resume the playback. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:332](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L332)

___

### updatePlayers

▸ **updatePlayers**(): `void`

Private method to update player information in the map.

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:103](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L103)

___

### validateNumberParam

▸ **validateNumberParam**(`param`, `paramName`): `void`

Private method to validate a number parameter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `number` | The number parameter to validate. |
| `paramName` | `string` | The name of the parameter. |

#### Returns

`void`

**`Throws`**

Error if the parameter is not a valid number.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:453](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Entities/MoonlinkPlayer.ts#L453)
