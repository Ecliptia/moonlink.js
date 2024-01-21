[moonlink.js](../README.md) / [Exports](../modules.md) / Nodes

# Class: Nodes

## Table of contents

### Constructors

- [constructor](Nodes.md#constructor)

### Properties

- [\_manager](Nodes.md#_manager)
- [initiated](Nodes.md#initiated)
- [map](Nodes.md#map)

### Methods

- [add](Nodes.md#add)
- [check](Nodes.md#check)
- [get](Nodes.md#get)
- [init](Nodes.md#init)
- [remove](Nodes.md#remove)
- [sortByUsage](Nodes.md#sortbyusage)
- [sortNodesByCalls](Nodes.md#sortnodesbycalls)
- [sortNodesByLavalinkCpuLoad](Nodes.md#sortnodesbylavalinkcpuload)
- [sortNodesByMemoryUsage](Nodes.md#sortnodesbymemoryusage)
- [sortNodesByPlayers](Nodes.md#sortnodesbyplayers)
- [sortNodesByPlayingPlayers](Nodes.md#sortnodesbyplayingplayers)
- [sortNodesBySystemCpuLoad](Nodes.md#sortnodesbysystemcpuload)

## Constructors

### constructor

• **new Nodes**(): [`Nodes`](Nodes.md)

#### Returns

[`Nodes`](Nodes.md)

#### Defined in

[src/@Utils/Structure.ts:213](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L213)

## Properties

### \_manager

• **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:211](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L211)

___

### initiated

• **initiated**: `boolean` = `false`

#### Defined in

[src/@Utils/Structure.ts:210](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L210)

___

### map

• **map**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:212](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L212)

## Methods

### add

▸ **add**(`node`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `node` | [`INode`](../interfaces/INode.md) |

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:238](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L238)

___

### check

▸ **check**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:225](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L225)

___

### get

▸ **get**(`name`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `any` |

#### Returns

`any`

#### Defined in

[src/@Utils/Structure.ts:265](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L265)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:216](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L216)

___

### remove

▸ **remove**(`name`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`boolean`

#### Defined in

[src/@Utils/Structure.ts:253](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L253)

___

### sortByUsage

▸ **sortByUsage**(`sortType`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `sortType` | [`SortType`](../modules.md#sorttype) |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:268](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L268)

___

### sortNodesByCalls

▸ **sortNodesByCalls**(`nodes`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`MoonlinkNode`](MoonlinkNode.md)[] |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:316](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L316)

___

### sortNodesByLavalinkCpuLoad

▸ **sortNodesByLavalinkCpuLoad**(`nodes`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`MoonlinkNode`](MoonlinkNode.md)[] |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:302](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L302)

___

### sortNodesByMemoryUsage

▸ **sortNodesByMemoryUsage**(`nodes`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`MoonlinkNode`](MoonlinkNode.md)[] |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:296](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L296)

___

### sortNodesByPlayers

▸ **sortNodesByPlayers**(`nodes`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`MoonlinkNode`](MoonlinkNode.md)[] |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:325](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L325)

___

### sortNodesByPlayingPlayers

▸ **sortNodesByPlayingPlayers**(`nodes`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`MoonlinkNode`](MoonlinkNode.md)[] |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:319](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L319)

___

### sortNodesBySystemCpuLoad

▸ **sortNodesBySystemCpuLoad**(`nodes`): [`MoonlinkNode`](MoonlinkNode.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodes` | [`MoonlinkNode`](MoonlinkNode.md)[] |

#### Returns

[`MoonlinkNode`](MoonlinkNode.md)[]

#### Defined in

[src/@Utils/Structure.ts:309](https://github.com/Ecliptia/moonlink.js/blob/a19be7d/src/@Utils/Structure.ts#L309)
