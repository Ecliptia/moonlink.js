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
| `clientId` | `string` |

#### Returns

[`MoonlinkDatabase`](MoonlinkDatabase.md)

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:10](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L10)

## Properties

### data

• `Private` **data**: `Data` = `{}`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:7](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L7)

___

### id

• `Private` **id**: `string`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:8](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L8)

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

[src/@Utils/MoonlinkDatabase.ts:45](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L45)

___

### fetch

▸ **fetch**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:95](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L95)

___

### get

▸ **get**\<`T`\>(`key`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`T`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:25](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L25)

___

### getFilePath

▸ **getFilePath**(): `string`

#### Returns

`string`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:87](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L87)

___

### push

▸ **push**\<`T`\>(`key`, `value`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `T` |

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:31](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L31)

___

### save

▸ **save**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:115](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L115)

___

### set

▸ **set**\<`T`\>(`key`, `value`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `T` |

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:15](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L15)

___

### updateData

▸ **updateData**(`data`, `keys`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Data` |
| `keys` | `string`[] |
| `value` | `any` |

#### Returns

`void`

#### Defined in

[src/@Utils/MoonlinkDatabase.ts:72](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/MoonlinkDatabase.ts#L72)
