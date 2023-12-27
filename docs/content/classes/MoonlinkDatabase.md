[moonlink.js](../README.md) / [Exports](../modules.md) / MoonlinkDatabase

# Class: MoonlinkDatabase

## Table of contents

### Constructors

- [constructor](MoonlinkDatabase.md#constructor)

### Properties

- [data](MoonlinkDatabase.md#data)
- [id](MoonlinkDatabase.md#id)

### Methods

- [delete](MoonlinkDatabase.md#delete)
- [fetch](MoonlinkDatabase.md#fetch)
- [get](MoonlinkDatabase.md#get)
- [getFilePath](MoonlinkDatabase.md#getfilepath)
- [push](MoonlinkDatabase.md#push)
- [save](MoonlinkDatabase.md#save)
- [set](MoonlinkDatabase.md#set)
- [updateData](MoonlinkDatabase.md#updatedata)

## Constructors

### constructor

• **new MoonlinkDatabase**(`clientId`): [`MoonlinkDatabase`](MoonlinkDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `clientId` | `any` |

#### Returns

[`MoonlinkDatabase`](MoonlinkDatabase.md)

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:7](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L7)

## Properties

### data

• `Private` **data**: `object` = `{}`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:5](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L5)

___

### id

• `Private` **id**: `any`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:6](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L6)

## Methods

### delete

▸ **delete**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`boolean`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:42](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L42)

___

### fetch

▸ **fetch**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:92](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L92)

___

### get

▸ **get**(`key`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`any`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:22](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L22)

___

### getFilePath

▸ **getFilePath**(): `string`

#### Returns

`string`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:84](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L84)

___

### push

▸ **push**(`key`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:28](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L28)

___

### save

▸ **save**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:112](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L112)

___

### set

▸ **set**(`key`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:12](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L12)

___

### updateData

▸ **updateData**(`data`, `keys`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `object` |
| `keys` | `string`[] |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:69](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/MoonlinkDatabase.ts#L69)
