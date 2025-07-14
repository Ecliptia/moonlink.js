---
title: WebSocket
description: "API reference for the custom WebSocket client in Moonlink.js"
icon: 'lucide:message-circle'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:message-circle"}
#title
WebSocket Class

#description
The `WebSocket` class in Moonlink.js is a custom implementation of a WebSocket client, extending Node.js's `EventEmitter`. It handles the low-level WebSocket protocol for communication with Lavalink servers.
<br>

::alert{type="info" icon="lucide:info"}
This class is primarily used internally by Moonlink.js for node communication and is generally not intended for direct use by consumers of the library.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `url` | `URL` | The URL of the WebSocket server. |
| `headers` | `Record<string, string>` | Headers sent during the WebSocket handshake. |
| `connected` | `boolean` | Indicates whether the WebSocket is currently connected. |

## Methods

#### constructor
::field{name="constructor" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:wrench'
  ---
  #title
  Constructor

  #description
  Creates a new WebSocket instance and initiates the connection.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="url" type="string" required}
    The WebSocket server URL (e.g., `ws://localhost:2333/v4/websocket`).
    ::
    ::field{name="options" type="Object"}
    Optional: Configuration options.
    ::
    ::field{name="options.headers" type="Record<string, string>"}
    Optional: Custom headers to send during the handshake.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`WebSocket`**

  ```js
  // Used internally by Node class
  // const socket = new WebSocket('ws://localhost:2333/v4/websocket', { headers: { Authorization: 'youshallnotpass' } });
  ```
  ::
::
::

#### send
::field{name="send" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:send'
  ---
  #title
  Send Data

  #description
  Sends data over the WebSocket connection.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="data" type="string | Buffer" required}
    The data to send (string or Buffer).
    ::
    ::field{name="cb" type="(err?: Error) => void"}
    Optional: A callback function to be called when the send operation completes.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Used internally by Node class
  // socket.send(JSON.stringify({ op: 'play', /* ... */ }));
  ```
  ::
::
::

#### close
::field{name="close" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:x-circle'
  ---
  #title
  Close Connection

  #description
  Closes the WebSocket connection.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="code" type="number" defaultValue="1000"}
    Optional: The WebSocket close code.
    ::
    ::field{name="reason" type="string" defaultValue="''"}
    Optional: A reason for closing the connection.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Used internally by Node class
  // socket.close(1000, 'Normal Closure');
  ```
  ::
::
::

#### addEventListener
::field{name="addEventListener" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:bell'
  ---
  #title
  Add Event Listener

  #description
  Registers an event listener for WebSocket events.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="event" type="string" required}
    The event name (e.g., `open`, `message`, `close`, `error`).
    ::
    ::field{name="listener" type="(...args: any[]) => void" required}
    The callback function for the event.
    ::
    ::field{name="options" type="{ once?: boolean }"}
    Optional: Options for the listener (e.g., `once: true` for a one-time listener).
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Used internally by Node class
  // socket.addEventListener('message', (event) => console.log('Received:', event.data));
  ```
  ::
::
::

## Events

The `WebSocket` class extends `EventEmitter` and emits the following events:

| Event | Description | Parameters |
|-------|-------------|------------|
| `open` | Emitted when the WebSocket connection is established. | `void` |
| `message` | Emitted when a message is received from the server. | `{ data: string | Buffer }` |
| `close` | Emitted when the WebSocket connection is closed. | `{ code: number, reason: string }` |
| `error` | Emitted when an error occurs. | `{ error: Error }` |
| `ping` | Emitted when a ping frame is received. | `void` |
| `pong` | Emitted when a pong frame is received. | `void` |

## Usage Example

::card{icon="lucide:code"}
#title
Basic Usage

#description
Example of how the WebSocket class is used internally by the Node.
<br>
<h5>Code Example</h5>

#content
```js
// This is an internal class, direct usage is generally not recommended.
// Example of how it's used within the Node class:

// In Node's connect method:
// this.socket = new WebSocket(
//   `ws${this.secure ? "s" : ""}://${this.address}/${this.pathVersion}/websocket`,
//   {
//     headers: {
//       Authorization: this.password,
//       "User-Id": this.manager.options.clientId,
//       "Client-Name": this.manager.options.clientName,
//     },
//   }
// );
// this.socket.addEventListener('open', this.open.bind(this), { once: true });
// this.socket.addEventListener('close', this.close.bind(this), { once: true });
// this.socket.addEventListener('message', this.message.bind(this));
// this.socket.addEventListener('error', this.error.bind(this));

// In Node's message method (handling incoming data):
// this.socket.send(JSON.stringify({ op: 'pong' }));

// In Node's close method:
// this.socket.close();
```

#footer
This example demonstrates basic operations using the WebSocket class.
::
