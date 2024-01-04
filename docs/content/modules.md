[moonlink.js](README.md) / Exports

# moonlink.js

## Table of contents

### Classes

- [MoonlinkDatabase](classes/MoonlinkDatabase.md)
- [MoonlinkFilters](classes/MoonlinkFilters.md)
- [MoonlinkManager](classes/MoonlinkManager.md)
- [MoonlinkNode](classes/MoonlinkNode.md)
- [MoonlinkPlayer](classes/MoonlinkPlayer.md)
- [MoonlinkQueue](classes/MoonlinkQueue.md)
- [MoonlinkRestFul](classes/MoonlinkRestFul.md)
- [MoonlinkTrack](classes/MoonlinkTrack.md)
- [Nodes](classes/Nodes.md)
- [Players](classes/Players.md)
- [Plugin](classes/Plugin.md)
- [Structure](classes/Structure.md)
- [WebSocket](classes/WebSocket.md)

### Interfaces

- [ChannelMix](interfaces/ChannelMix.md)
- [Distortion](interfaces/Distortion.md)
- [Equalizer](interfaces/Equalizer.md)
- [Extendable](interfaces/Extendable.md)
- [IHeaders](interfaces/IHeaders.md)
- [INode](interfaces/INode.md)
- [INodeStats](interfaces/INodeStats.md)
- [IOptions](interfaces/IOptions.md)
- [Karaoke](interfaces/Karaoke.md)
- [LavalinkResult](interfaces/LavalinkResult.md)
- [LowPass](interfaces/LowPass.md)
- [MoonlinkEvents](interfaces/MoonlinkEvents.md)
- [MoonlinkTrackOptions](interfaces/MoonlinkTrackOptions.md)
- [PlayerInfos](interfaces/PlayerInfos.md)
- [PlaylistInfo](interfaces/PlaylistInfo.md)
- [RestOptions](interfaces/RestOptions.md)
- [Rotation](interfaces/Rotation.md)
- [SearchQuery](interfaces/SearchQuery.md)
- [SearchResult](interfaces/SearchResult.md)
- [Timescale](interfaces/Timescale.md)
- [TrackData](interfaces/TrackData.md)
- [TrackDataInfo](interfaces/TrackDataInfo.md)
- [TrackInfo](interfaces/TrackInfo.md)
- [Tremolo](interfaces/Tremolo.md)
- [Vibrato](interfaces/Vibrato.md)
- [VoiceOptions](interfaces/VoiceOptions.md)
- [VoicePacket](interfaces/VoicePacket.md)
- [VoiceServer](interfaces/VoiceServer.md)
- [VoiceState](interfaces/VoiceState.md)
- [connectOptions](interfaces/connectOptions.md)
- [createOptions](interfaces/createOptions.md)
- [objectTrack](interfaces/objectTrack.md)

### Type Aliases

- [Constructor](modules.md#constructor)
- [Endpoint](modules.md#endpoint)
- [FrameOptions](modules.md#frameoptions)
- [Headers](modules.md#headers)
- [LoadType](modules.md#loadtype)
- [SearchPlatform](modules.md#searchplatform)
- [SortType](modules.md#sorttype)
- [WebSocketOptions](modules.md#websocketoptions)

### Variables

- [State](modules.md#state)
- [version](modules.md#version)

### Functions

- [makeRequest](modules.md#makerequest)

## Type Aliases

### Constructor

Ƭ **Constructor**\<`T`\>: (...`args`: `any`[]) => `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

• (`...args`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`T`

#### Defined in

[src/@Typings/index.ts:13](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Typings/index.ts#L13)

___

### Endpoint

Ƭ **Endpoint**: `string`

#### Defined in

[src/@Typings/index.ts:180](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Typings/index.ts#L180)

___

### FrameOptions

Ƭ **FrameOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fin` | `boolean` |
| `len` | `number` |
| `opcode` | `number` |

#### Defined in

[src/@Services/PerforCWebsocket.ts:14](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/PerforCWebsocket.ts#L14)

___

### Headers

Ƭ **Headers**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Authorization?` | `string` \| ``null`` |

#### Defined in

[src/@Services/MoonlinkMakeRequest.ts:5](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkMakeRequest.ts#L5)

___

### LoadType

Ƭ **LoadType**: ``"track"`` \| ``"playlist"`` \| ``"search"`` \| ``"empty"`` \| ``"error"``

#### Defined in

[src/@Typings/index.ts:57](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Typings/index.ts#L57)

___

### SearchPlatform

Ƭ **SearchPlatform**: ``"youtube"`` \| ``"youtubemusic"`` \| ``"soundcloud"`` \| `string`

#### Defined in

[src/@Typings/index.ts:76](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Typings/index.ts#L76)

___

### SortType

Ƭ **SortType**: ``"memory"`` \| ``"cpuLavalink"`` \| ``"cpuSystem"`` \| ``"calls"`` \| ``"playingPlayers"`` \| ``"players"``

#### Defined in

[src/@Typings/index.ts:24](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Typings/index.ts#L24)

___

### WebSocketOptions

Ƭ **WebSocketOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `headers?` | `any` |
| `timeout?` | `number` |

#### Defined in

[src/@Services/PerforCWebsocket.ts:9](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/PerforCWebsocket.ts#L9)

## Variables

### State

• `Const` **State**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AUTORESUMING` | `string` |
| `CONNECTED` | `string` |
| `CONNECTING` | `string` |
| `DISCONNECTED` | `string` |
| `DISCONNECTING` | `string` |
| `MOVING` | `string` |
| `READY` | `string` |
| `RECONNECTING` | `string` |
| `RESUMING` | `string` |

#### Defined in

[src/@Utils/Structure.ts:20](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L20)

___

### version

• `Const` **version**: `string`

#### Defined in

[index.ts:3](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/index.ts#L3)

## Functions

### makeRequest

▸ **makeRequest**(`uri`, `options`, `data?`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `options` | `any` |
| `data?` | `any` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/@Services/MoonlinkMakeRequest.ts:9](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Services/MoonlinkMakeRequest.ts#L9)
