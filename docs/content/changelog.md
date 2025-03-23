---
title: Changelog
description: "Changelog for Moonlink.js"
icon: 'lucide:code-2'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmE5NDVhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

## Version 4.4.28 ->  4.4.36

::card{icon="lucide:database"}
#title
Database System Enhancements

#description
- Added `disableDatabase` option to Manager configuration
- Added type safety with generics for database operations
- Added nested key support with dot notation
- Added automatic data persistence
- Added database disable functionality
::

::card{icon="lucide:server"}
#title
Node Management Improvements

#description
- Added `getSystemStats()` method for CPU and memory monitoring
- Added `isOverloaded()` method with configurable thresholds
- Added `getNodeInfo()` for detailed node information
- Added `migrateAllPlayers()` for node migration
- Added `needsRestart()` to detect node health issues
- Added `getNodeStatus()` for comprehensive status
- Added `checkHealth()` for node health monitoring
::

::card{icon="lucide:list-ordered"}
#title
Queue Management Features

#description
- Added `find()` method to search tracks
- Added `move()` method to reorder tracks
- Added `slice()` method for queue segments
- Added `filter()` method for track filtering
- Added `reverse()` method to invert queue
- Added `position` and `previous` getters
::

::card{icon="lucide:music"}
#title
Player Features

#description
- Added `has()` method to check properties
- Added `delete()` method to remove properties
- Added improved data management system
- Added player transfer between nodes capability
::

::card{icon="lucide:refresh-cw"}
#title
Changed Features

#description
- Renamed `generateShortUUID` to `generateUUID` for clarity
- Improved node selection and load balancing
- Enhanced player data management
- Updated WebSocket connection handling
- Improved error handling and validation
- Enhanced session management
- Updated node configuration requirements
::

::alert{type="warning" icon="lucide:alert-triangle"}
### Deprecated Methods
The following methods in Manager class are now deprecated:
- `createPlayer()` - Use `players.create()` instead
- `getPlayer()` - Use `players.get()` instead
- `hasPlayer()` - Use `players.has()` instead
- `deletePlayer()` - Use `players.delete()` instead
::

::card{icon="lucide:check-circle"}
#title
Fixed Issues

#description
- Fixed trailing comma in accept-encoding header
- Improved node reconnection handling
- Enhanced player state persistence
- Fixed queue state management
- Improved error recovery mechanisms
::

::card{icon="lucide:code"}
#title
Internal Improvements

#description
- Added comprehensive TypeScript types
- Improved code organization
- Enhanced debugging capabilities
- Added strict null checks
- Updated documentation
::

::alert{type="danger" icon="lucide:alert-octagon"}
### Breaking Changes
- Changed database interaction methods
- Modified node identification system
- Updated player data management approach
- Changed event payload structures
::
<br>

::button-link{right-icon="lucide:arrow-up-right" to="https://github.com/Ecliptia/moonlink.js" target="_blank"}
  For more details, check our GitHub repository
::