---
title: NodeManager
---

# Class: NodeManager

## Table of contents

### Constructors

- [constructor](NodeManager.md#constructor)

### Methods

- [init](NodeManager.md#init)
- [check](NodeManager.md#check)
- [add](NodeManager.md#add)
- [remove](NodeManager.md#remove)
- [get](NodeManager.md#get)
- [sortByUsage](NodeManager.md#sortbyusage)

## Constructors

### constructor

• **new NodeManager**(): [`NodeManager`](NodeManager.md)

Creates a new instance of NodeManager.

#### Returns

[`NodeManager`](NodeManager.md) - The created instance of NodeManager.

## Methods

### init

▸ **init**(): `void`

Initializes the NodeManager instance.

#### Returns

`void`

### check

▸ **check**(): `void`

Checks the validity of the nodes configuration.

#### Returns

`void`

### add

▸ **add**(`node`: `INode`): `void`

Adds a new node to the manager.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `node` | `INode` | Node configuration. |

#### Returns

`void`

### remove

▸ **remove**(`name`: `string`): `boolean`

Removes a node from the manager.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Name or identifier of the node to remove. |

#### Returns

`boolean` - Indicates whether the node was successfully removed.

### get

▸ **get**(`name`: `string`): `MoonlinkNode` | `null`

Gets a node by its name or identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Name or identifier of the node to get. |

#### Returns

`MoonlinkNode` | `null` - The node instance, or null if not found.

### sortByUsage

▸ **sortByUsage**(`sortType`: `SortType`): `MoonlinkNode`[]

Sorts nodes by usage metrics.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortType` | `SortType` | Type of sorting to perform. |

#### Returns

`MoonlinkNode`[] - An array of sorted MoonlinkNode instances.
