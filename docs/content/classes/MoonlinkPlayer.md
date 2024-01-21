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

[src/@Entities/MoonlinkPlayer.ts:39](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L39)

## Properties

### autoLeave

• **autoLeave**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:18](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L18)

___

### autoPlay

• **autoPlay**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:17](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L17)

___

### connected

• **connected**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:19](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L19)

___

### current

• **current**: `Record`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:27](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L27)

___

### data

• **data**: `Record`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:29](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L29)

___

### guildId

• **guildId**: `string`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:14](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L14)

___

### infos

• `Private` **infos**: [`PlayerInfos`](../interfaces/PlayerInfos.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:12](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L12)

___

### loop

• **loop**: `number`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:22](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L22)

___

### manager

• **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:11](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L11)

___

### map

• `Private` **map**: `Map`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:13](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L13)

___

### node

• **node**: `any`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:30](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L30)

___

### paused

• **paused**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:21](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L21)

___

### ping

• **ping**: `number`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:25](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L25)

___

### playing

• **playing**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:20](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L20)

___

### previous

• **previous**: `Record`\<`string`, `any`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:28](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L28)

___

### queue

• **queue**: [`MoonlinkQueue`](MoonlinkQueue.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:26](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L26)

___

### rest

• **rest**: [`MoonlinkRestFul`](MoonlinkRestFul.md)

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:31](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L31)

___

### shuffled

• **shuffled**: `boolean`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:24](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L24)

___

### textChannel

• **textChannel**: `string`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:15](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L15)

___

### voiceChannel

• **voiceChannel**: `string`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:16](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L16)

___

### volume

• **volume**: `number`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:23](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L23)

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

[src/@Entities/MoonlinkPlayer.ts:203](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L203)

___

### destroy

▸ **destroy**(): `Promise`\<`boolean`\>

Destroy the player, disconnecting it and removing player data.

#### Returns

`Promise`\<`boolean`\>

True if the player was successfully destroyed.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:487](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L487)

___

### disconnect

▸ **disconnect**(): `boolean`

Disconnect the player from the voice channel.

#### Returns

`boolean`

True if the disconnection was successful.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:226](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L226)

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

[src/@Entities/MoonlinkPlayer.ts:125](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L125)

___

### pause

▸ **pause**(): `Promise`\<`boolean`\>

Pause the playback.

#### Returns

`Promise`\<`boolean`\>

True if paused successfully.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:330](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L330)

___

### play

▸ **play**(`track?`): `Promise`\<`boolean`\>

Play the next track in the queue.

#### Parameters

| Name | Type |
| :------ | :------ |
| `track?` | `string` \| [`MoonlinkTrack`](MoonlinkTrack.md) |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:276](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L276)

___

### restart

▸ **restart**(): `Promise`\<`void`\>

Restart the player by reconnecting and updating its state.

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:247](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L247)

___

### resume

▸ **resume**(): `Promise`\<`boolean`\>

Resume the playback.

#### Returns

`Promise`\<`boolean`\>

True if resumed successfully.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:340](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L340)

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

[src/@Entities/MoonlinkPlayer.ts:522](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L522)

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

[src/@Entities/MoonlinkPlayer.ts:115](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L115)

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

[src/@Entities/MoonlinkPlayer.ts:170](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L170)

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

[src/@Entities/MoonlinkPlayer.ts:187](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L187)

___

### setLoop

▸ **setLoop**(`mode`): `string` \| `number`

Set the loop mode for the player.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mode` | `string` \| `number` | Loop mode (0 for no loop, 1 for single track, 2 for entire queue). |

#### Returns

`string` \| `number`

The new loop mode.

**`Throws`**

Error if the mode is not a valid number or out of range.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:459](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L459)

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

[src/@Entities/MoonlinkPlayer.ts:136](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L136)

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

[src/@Entities/MoonlinkPlayer.ts:156](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L156)

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

[src/@Entities/MoonlinkPlayer.ts:433](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L433)

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

[src/@Entities/MoonlinkPlayer.ts:550](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L550)

___

### skip

▸ **skip**(`position?`): `Promise`\<`boolean`\>

Skip to the next track in the queue.

#### Parameters

| Name | Type |
| :------ | :------ |
| `position?` | `number` |

#### Returns

`Promise`\<`boolean`\>

True if the next track was successfully played.

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:382](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L382)

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

[src/@Entities/MoonlinkPlayer.ts:363](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L363)

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

[src/@Entities/MoonlinkPlayer.ts:350](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L350)

___

### updatePlayers

▸ **updatePlayers**(): `void`

Private method to update player information in the map.

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkPlayer.ts:104](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L104)

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

[src/@Entities/MoonlinkPlayer.ts:508](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Entities/MoonlinkPlayer.ts#L508)
