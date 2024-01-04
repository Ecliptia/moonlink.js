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

[src/@Utils/Structure.ts:209](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L209)

## Properties

### \_manager

• **\_manager**: [`MoonlinkManager`](MoonlinkManager.md)

#### Defined in

[src/@Utils/Structure.ts:207](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L207)

___

### initiated

• **initiated**: `boolean` = `false`

#### Defined in

[src/@Utils/Structure.ts:206](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L206)

___

### map

• **map**: `Map`\<`any`, `any`\>

#### Defined in

[src/@Utils/Structure.ts:208](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L208)

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

[src/@Utils/Structure.ts:234](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L234)

___

### check

▸ **check**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:221](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L221)

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

[src/@Utils/Structure.ts:261](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L261)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/@Utils/Structure.ts:212](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L212)

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

[src/@Utils/Structure.ts:249](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L249)

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

[src/@Utils/Structure.ts:264](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L264)

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

[src/@Utils/Structure.ts:312](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L312)

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

[src/@Utils/Structure.ts:298](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L298)

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

[src/@Utils/Structure.ts:292](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L292)

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

[src/@Utils/Structure.ts:321](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L321)

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

[src/@Utils/Structure.ts:315](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L315)

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

[src/@Utils/Structure.ts:305](https://github.com/Ecliptia/moonlink.js/blob/ab259c6/src/@Utils/Structure.ts#L305)
