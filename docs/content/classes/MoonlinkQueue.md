[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkQueue

# Class: MoonlinkQueue

## Table of contents

### Constructors

- [constructor](MoonlinkQueue.md#constructor)

### Properties

- [db](MoonlinkQueue.md#db)
- [guildId](MoonlinkQueue.md#guildid)
- [manager](MoonlinkQueue.md#manager)

### Accessors

- [all](MoonlinkQueue.md#all)
- [size](MoonlinkQueue.md#size)

### Methods

- [add](MoonlinkQueue.md#add)
- [clear](MoonlinkQueue.md#clear)
- [first](MoonlinkQueue.md#first)
- [getQueue](MoonlinkQueue.md#getqueue)
- [has](MoonlinkQueue.md#has)
- [remove](MoonlinkQueue.md#remove)
- [setQueue](MoonlinkQueue.md#setqueue)

## Constructors

### constructor

• **new MoonlinkQueue**(`manager`, `data`): [`MoonlinkQueue`](MoonlinkQueue.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `manager` | `MoonlinkManager` |
| `data` | `Object` |
| `data.guildId` | `string` |

#### Returns

[`MoonlinkQueue`](MoonlinkQueue.md)

#### Defined in

[src/@Entities/MoonlinkQueue.ts:13](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L13)

## Properties

### db

• **db**: `MoonlinkDatabase` = `Structure.db`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:9](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L9)

___

### guildId

• `Private` **guildId**: `string`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:10](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L10)

___

### manager

• `Private` **manager**: `MoonlinkManager`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:11](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L11)

## Accessors

### all

• `get` **all**(): `any`

#### Returns

`any`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:85](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L85)

___

### size

• `get` **size**(): `number`

#### Returns

`number`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:63](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L63)

## Methods

### add

▸ **add**(`data`, `position?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `MoonlinkTrack` |
| `position?` | `number` |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:24](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L24)

___

### clear

▸ **clear**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:54](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L54)

___

### first

▸ **first**(): `any`

#### Returns

`any`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:49](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L49)

___

### getQueue

▸ **getQueue**(): `MoonlinkTrack`[]

#### Returns

`MoonlinkTrack`[]

#### Defined in

[src/@Entities/MoonlinkQueue.ts:89](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L89)

___

### has

▸ **has**(`identifier`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | `string` |

#### Returns

`boolean`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:41](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L41)

___

### remove

▸ **remove**(`position`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `number` |

#### Returns

`boolean`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:67](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L67)

___

### setQueue

▸ **setQueue**(`queue`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `queue` | `MoonlinkTrack`[] |

#### Returns

`void`

#### Defined in

[src/@Entities/MoonlinkQueue.ts:93](https://github.com/Ecliptia/moonlink.js/blob/694fece/src/@Entities/MoonlinkQueue.ts#L93)
