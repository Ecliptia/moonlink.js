[moonlink.js](../README.md) / [Exports](../modules.md) / Structure

# Class: Structure

## Table of contents

### Constructors

- [constructor](Structure.md#constructor)

### Properties

- [db](Structure.md#db)
- [manager](Structure.md#manager)

### Methods

- [extend](Structure.md#extend)
- [get](Structure.md#get)
- [init](Structure.md#init)

## Constructors

### constructor

• **new Structure**(): [`Structure`](Structure.md)

#### Returns

[`Structure`](Structure.md)

## Properties

### db

▪ `Static` **db**: [`MoonlinkDatabase`](MoonlinkDatabase.md)

#### Defined in

[src/@Utils/Structure.ts:346](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L346)

___

### manager

▪ `Static` **manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:345](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L345)

## Methods

### extend

▸ **extend**\<`K`, `T`\>(`name`, `extender`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`Extendable`](../interfaces/Extendable.md) |
| `T` | extends typeof [`MoonlinkManager`](MoonlinkManager.md) \| typeof [`MoonlinkNode`](MoonlinkNode.md) \| typeof [`MoonlinkPlayer`](MoonlinkPlayer.md) \| typeof [`MoonlinkQueue`](MoonlinkQueue.md) \| typeof [`MoonlinkRestFul`](MoonlinkRestFul.md) \| typeof [`MoonlinkDatabase`](MoonlinkDatabase.md) \| typeof [`MoonlinkFilters`](MoonlinkFilters.md) \| typeof [`MoonlinkTrack`](MoonlinkTrack.md) \| typeof [`Players`](Players.md) \| typeof [`Nodes`](Nodes.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `K` |
| `extender` | (`target`: [`Extendable`](../interfaces/Extendable.md)[`K`]) => `T` |

#### Returns

`T`

#### Defined in

[src/@Utils/Structure.ts:347](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L347)

___

### get

▸ **get**\<`K`\>(`name`): [`Extendable`](../interfaces/Extendable.md)[`K`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`Extendable`](../interfaces/Extendable.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `K` |

#### Returns

[`Extendable`](../interfaces/Extendable.md)[`K`]

#### Defined in

[src/@Utils/Structure.ts:369](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L369)

___

### init

▸ **init**(`manager`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `manager` | [`MoonlinkManager`](MoonlinkManager.md) |

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:360](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L360)
