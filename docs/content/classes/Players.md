[moonlink.js](../README.md) / [Exports](../modules.md) / Players

# Class: Players

## Table of contents

### Constructors

- [constructor](Players.md#constructor)

### Properties

- [\_manager](Players.md#_manager)
- [cache](Players.md#cache)
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

[src/@Utils/Structure.ts:31](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L31)

## Properties

### \_manager

• **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:28](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L28)

___

### cache

• `Optional` **cache**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:30](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L30)

___

### map

• **map**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:29](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L29)

## Accessors

### all

• `get` **all**(): `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:205](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L205)

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

[src/@Utils/Structure.ts:91](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L91)

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

[src/@Utils/Structure.ts:128](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L128)

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

[src/@Utils/Structure.ts:114](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L114)

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

[src/@Utils/Structure.ts:49](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L49)

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

[src/@Utils/Structure.ts:70](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L70)

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

[src/@Utils/Structure.ts:42](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L42)

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

[src/@Utils/Structure.ts:111](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L111)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:34](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L34)

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

[src/@Utils/Structure.ts:86](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L86)
