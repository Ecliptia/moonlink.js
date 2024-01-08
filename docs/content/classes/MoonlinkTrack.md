[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkTrack

# Class: MoonlinkTrack

## Table of contents

### Constructors

- [constructor](MoonlinkTrack.md#constructor)

### Properties

- [artworkUrl](MoonlinkTrack.md#artworkurl)
- [author](MoonlinkTrack.md#author)
- [duration](MoonlinkTrack.md#duration)
- [encoded](MoonlinkTrack.md#encoded)
- [identifier](MoonlinkTrack.md#identifier)
- [isSeekable](MoonlinkTrack.md#isseekable)
- [isStream](MoonlinkTrack.md#isstream)
- [isrc](MoonlinkTrack.md#isrc)
- [position](MoonlinkTrack.md#position)
- [requester](MoonlinkTrack.md#requester)
- [sourceName](MoonlinkTrack.md#sourcename)
- [time](MoonlinkTrack.md#time)
- [title](MoonlinkTrack.md#title)
- [url](MoonlinkTrack.md#url)

### Accessors

- [calculateRealTimePosition](MoonlinkTrack.md#calculaterealtimeposition)

### Methods

- [setPosition](MoonlinkTrack.md#setposition)
- [setTime](MoonlinkTrack.md#settime)

## Constructors

### constructor

• **new MoonlinkTrack**(`data`, `requester?`): [`MoonlinkTrack`](MoonlinkTrack.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`MoonlinkTrackOptions`](../interfaces/MoonlinkTrackOptions.md) |
| `requester?` | `any` |

#### Returns

[`MoonlinkTrack`](MoonlinkTrack.md)

#### Defined in

[src/@Utils/MoonlinkTrack.ts:17](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L17)

## Properties

### artworkUrl

• **artworkUrl**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:14](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L14)

___

### author

• **author**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:6](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L6)

___

### duration

• **duration**: `number`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:8](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L8)

___

### encoded

• **encoded**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:3](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L3)

___

### identifier

• **identifier**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:4](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L4)

___

### isSeekable

• **isSeekable**: `boolean`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:10](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L10)

___

### isStream

• **isStream**: `boolean`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:11](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L11)

___

### isrc

• **isrc**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:15](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L15)

___

### position

• **position**: `number`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:9](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L9)

___

### requester

• **requester**: `any`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:13](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L13)

___

### sourceName

• **sourceName**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:12](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L12)

___

### time

• `Optional` **time**: `number`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:16](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L16)

___

### title

• **title**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:5](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L5)

___

### url

• **url**: `string`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:7](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L7)

## Accessors

### calculateRealTimePosition

• `get` **calculateRealTimePosition**(): `number`

#### Returns

`number`

#### Defined in

[src/@Utils/MoonlinkTrack.ts:33](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L33)

## Methods

### setPosition

▸ **setPosition**(`data`): [`MoonlinkTrack`](MoonlinkTrack.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `number` |

#### Returns

[`MoonlinkTrack`](MoonlinkTrack.md)

#### Defined in

[src/@Utils/MoonlinkTrack.ts:52](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L52)

___

### setTime

▸ **setTime**(`data`): [`MoonlinkTrack`](MoonlinkTrack.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `number` |

#### Returns

[`MoonlinkTrack`](MoonlinkTrack.md)

#### Defined in

[src/@Utils/MoonlinkTrack.ts:56](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Utils/MoonlinkTrack.ts#L56)
