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

[src/@Utils/Structure.ts:197](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L197)

## Properties

### \_manager

• **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:195](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L195)

___

### initiated

• **initiated**: `boolean` = `false`

#### Defined in

[src/@Utils/Structure.ts:194](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L194)

___

### map

• **map**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:196](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L196)

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

[src/@Utils/Structure.ts:222](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L222)

___

### check

▸ **check**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:209](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L209)

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

[src/@Utils/Structure.ts:249](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L249)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:200](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L200)

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

[src/@Utils/Structure.ts:237](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L237)

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

[src/@Utils/Structure.ts:252](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L252)

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

[src/@Utils/Structure.ts:300](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L300)

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

[src/@Utils/Structure.ts:286](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L286)

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

[src/@Utils/Structure.ts:280](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L280)

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

[src/@Utils/Structure.ts:309](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L309)

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

[src/@Utils/Structure.ts:303](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L303)

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

[src/@Utils/Structure.ts:293](https://github.com/Ecliptia/moonlink.js/blob/695a75b/src/@Utils/Structure.ts#L293)
