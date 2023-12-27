[moonlink.js](../README.md) / [Exports](../modules.md) / Players

# Class: Players

## Table of contents

### Constructors

- [constructor](Players.md#constructor)

### Properties

- [\_manager](Players.md#_manager)
- [map](Players.md#map)

### Accessors

- [all](Players.md#all)

### Methods

- [attemptConnection](Players.md#attemptconnection)
- [create](Players.md#create)
- [get](Players.md#get)
- [handlePlayerDisconnect](Players.md#handleplayerdisconnect)
- [handlePlayerMove](Players.md#handleplayermove)
- [handleVoiceServerUpdate](Players.md#handlevoiceserverupdate)
- [has](Players.md#has)
- [init](Players.md#init)
- [updateVoiceStates](Players.md#updatevoicestates)

## Constructors

### constructor

• **new Players**(): [`Players`](Players.md)

#### Returns

[`Players`](Players.md)

#### Defined in

[src/@Utils/Structure.ts:35](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L35)

## Properties

### \_manager

• **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:33](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L33)

___

### map

• **map**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:34](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L34)

## Accessors

### all

• `get` **all**(): `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:201](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L201)

## Methods

### attemptConnection

▸ **attemptConnection**(`guildId`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/@Utils/Structure.ts:93](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L93)

___

### create

▸ **create**(`data`): [`MoonlinkPlayer`](MoonlinkPlayer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`createOptions`](../interfaces/createOptions.md) |

#### Returns

[`MoonlinkPlayer`](MoonlinkPlayer.md)

#### Defined in

[src/@Utils/Structure.ts:129](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L129)

___

### get

▸ **get**(`guildId`): [`MoonlinkPlayer`](MoonlinkPlayer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |

#### Returns

[`MoonlinkPlayer`](MoonlinkPlayer.md)

#### Defined in

[src/@Utils/Structure.ts:117](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L117)

___

### handlePlayerDisconnect

▸ **handlePlayerDisconnect**(`player`, `guildId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](MoonlinkPlayer.md) |
| `guildId` | `string` |

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:54](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L54)

___

### handlePlayerMove

▸ **handlePlayerMove**(`player`, `newChannelId`, `oldChannelId`, `guildId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `player` | [`MoonlinkPlayer`](MoonlinkPlayer.md) |
| `newChannelId` | `string` |
| `oldChannelId` | `string` |
| `guildId` | `string` |

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:72](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L72)

___

### handleVoiceServerUpdate

▸ **handleVoiceServerUpdate**(`update`, `guildId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `update` | `any` |
| `guildId` | `string` |

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:45](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L45)

___

### has

▸ **has**(`guildId`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |

#### Returns

`boolean`

#### Defined in

[src/@Utils/Structure.ts:111](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L111)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:38](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L38)

___

### updateVoiceStates

▸ **updateVoiceStates**(`guildId`, `update`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `guildId` | `string` |
| `update` | `any` |

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:88](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L88)
