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
- [PreviousInfosPlayer](interfaces/PreviousInfosPlayer.md)
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
- [LoadType](modules.md#loadtype)
- [SearchPlatform](modules.md#searchplatform)
- [SortType](modules.md#sorttype)

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

[src/@Typings/index.ts:15](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Typings/index.ts#L15)

___

### Endpoint

Ƭ **Endpoint**: `string`

#### Defined in

[src/@Typings/index.ts:184](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Typings/index.ts#L184)

___

### LoadType

Ƭ **LoadType**: ``"track"`` \| ``"playlist"`` \| ``"search"`` \| ``"empty"`` \| ``"error"``

#### Defined in

[src/@Typings/index.ts:59](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Typings/index.ts#L59)

___

### SearchPlatform

Ƭ **SearchPlatform**: ``"youtube"`` \| ``"youtubemusic"`` \| ``"soundcloud"`` \| `string`

#### Defined in

[src/@Typings/index.ts:78](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Typings/index.ts#L78)

___

### SortType

Ƭ **SortType**: ``"memory"`` \| ``"cpuLavalink"`` \| ``"cpuSystem"`` \| ``"calls"`` \| ``"playingPlayers"`` \| ``"players"``

#### Defined in

[src/@Typings/index.ts:26](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Typings/index.ts#L26)

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

[src/@Utils/Structure.ts:20](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/Structure.ts#L20)

___

### version

• `Const` **version**: `string`

#### Defined in

[index.ts:1](https://github.com/Ecliptia/moonlink.js/blob/694fece/index.ts#L1)

## Functions

### makeRequest

▸ **makeRequest**\<`T`\>(`uri`, `options`, `data?`): `Promise`\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `options` | `RequestOptions` \| `RequestOptions` & `SecureContextOptions` & \{ `checkServerIdentity?`: (`hostname`: `string`, `cert`: `PeerCertificate`) => `Error` \| `undefined` ; `rejectUnauthorized?`: `boolean` ; `servername?`: `string`  } & \{ `method?`: `string`  } |
| `data?` | `Record`\<`string`, `any`\> |

#### Returns

`Promise`\<`T`\>

#### Defined in

[src/@Services/MoonlinkMakeRequest.ts:6](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Services/MoonlinkMakeRequest.ts#L6)
