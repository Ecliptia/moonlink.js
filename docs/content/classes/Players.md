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

[src/@Utils/Structure.ts:30](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L30)

## Properties

### \_manager

• **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:28](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L28)

___

### map

• **map**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:29](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L29)

## Accessors

### all

• `get` **all**(): `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:189](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L189)

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

[src/@Utils/Structure.ts:82](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L82)

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

[src/@Utils/Structure.ts:117](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L117)

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

[src/@Utils/Structure.ts:105](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L105)

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

[src/@Utils/Structure.ts:47](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L47)

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

[src/@Utils/Structure.ts:61](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L61)

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

[src/@Utils/Structure.ts:40](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L40)

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

[src/@Utils/Structure.ts:102](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L102)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:33](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L33)

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

[src/@Utils/Structure.ts:77](https://github.com/Ecliptia/moonlink.js/blob/150c8e5/src/@Utils/Structure.ts#L77)
