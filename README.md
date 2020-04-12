# circuition
[![codecov](https://codecov.io/gh/c1moore/circuition/branch/master/graph/badge.svg?token=9D7MSKXU9P)](https://codecov.io/gh/c1moore/circuition) [![c1moore](https://circleci.com/gh/c1moore/circuition.svg?style=svg)](https://app.circleci.com/pipelines/github/c1moore/circuition)


An event emitter framework that allows you to control the full event lifecycle.  This package is very simple and doesn't require any external dependencies.

## Installation
```bash
npm install --save circuition
```

## Usage
Circuition is like a typical event emitter library, except it allows you to hook into the lifecycle of an event.  This gives you the ability to cancel an event before it happens and act on a successful event.

#### Import
TypeScript
```typescript
import { Circuition, EventPayload } from 'circuition';

const circuition = new Circuition();
```

JavaScript
```javascript
const { Circuition } = require('circuition');

const circuition = new Circuition();
```

### `registerEvent<T>(eventName: string, eventHandler: (payload: EventPayload<T>) => Promise<any>): void`
Registers a new event and the handler that is executed when the event is invoked.  Events must be registered before calling any other method on Circuition or an error will be thrown.

#### Parameters
- `eventName` - the name of the event
- `eventHandler` - the handler that performs the desired action when the event is fired

#### Example
```typescript
circuition.registerEvent<FormData>('form:submit', async (payload: EventPayload<FormData>): Promise<void> => {
  await fetch(url, {
    method: 'POST',
    body:   JSON.stringify(payload.data),
  });
});
```

### `registerBeforeListener<T>(eventName: string, listener: async (payload: EventPayload<T>) => Promise<void>): void`
Registers a new before listener for the specified event.  Before listeners can cancel an event by throwing an error (rejecting the returned Promise).  All before listeners for an event execute in parallel, so order is not guaranteed.

#### Parameters
- `eventName` - the name of the event to which the listener should be added
- `listener` - the function that will be executed before the event is fired

#### Example
```typescript
circuition.registerBeforeListener<FormData>('form:submit', async (payload: EventPayload<FormData>): Promise<void> => {
  // Check if the email is valid.
  if (!emailRegex.test(payload.data?.email)) {
    throw new Error('Invalid Email');
  }
});

circuition.registerBeforeListener<FormData>('form:submit', async (payload: EventPayload<FormData>): Promise<void> => {
  // Check if the email is taken.
  const res = await fetch(url, {
    method: 'POST',
    body:   JSON.stringify({ email: payload.data?.email }),
  });

  const { isTaken } = await res.json();

  if (isTaken) {
    throw new Error('Email address already taken.');
  }
});
```

### `registerAfterListener<T>(eventName: string, listener: async (payload: EventPayload<T>) => Promise<void>): void`
Registers a new after listener for the specified event.  After listeners are only executed if the event as fired and successfully completed.  All after listeners for an event execute in parallel, so order is not guaranteed.

#### Parameters
- `eventName` - the name of the event to which the listener should be added
- `listener` - the function that will be executed after the event has successfully completed

#### Example
```typescript
circuition.registerAfterListener<FormData>('form:submit', async (payload: EventPayload<FormData>): Promise<void> => {
  window.location.replace(accountPage);
});

circuition.registerAfterListener<FormData>('form:submit', async (payload: EventPayload<FormData>): Promise<void> => {
  await externalTracker.track('signup', payload.data);
});
```

### `invokeEvent<T>(payload: EventPayload<T>): Promise<void>`
Invokes the action specified in the payload.  This will cause the entire event lifecycle to trigger (i.e. before listeners will be invoked, then the event handler, and finally the after listeners).

#### Parameters
- `payload` - the EventPayload associated with the event.  This object contains the `eventName` and a `data` object.

#### Example
```typescript
circuition.invokeEvent<FormData>({
  eventName:  'form:submit',
  data:       formData,
});
```

## Testing
To run the tests for this project, just execute

```bash
npm test
```

To see a coverage report, check at the [Codecov report](https://codecov.io/gh/c1moore/circuition).

## Debugging
To help with debugging, Circuition can be passed a flag to enable logging and a custom logger (optional).

```typescript
// Use default logger (console).
const circuition = new Circuition(true);

// Use winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
});

const circuition = new Circuition(true, logger);
```

## Contributing
What to contribute?  Awesome!  Pull requests are always welcome.  If you'd like to contribute, please follow these simple rules:

1. Base PRs against `master`
2. Either submit a PR for an existing ticket or create a new ticket to avoid duplication of work.
3. Make sure to add any necessary tests and documentation for your changes.

## Credit
This library is strongly based on [Twilio's](https://www.twilio.com/) [Action Framework](https://www.twilio.com/docs/flex/actions-framework) for [Twilio Flex](https://www.twilio.com/flex).  This framework has been very powerful while developing Flex plugins, but does not appear to be widely available outside of the Flex UI.  While developing this library, I took the opportunity to address some of the parts of the Actions Framework I felt were a little off, like prepending `before` and `after` to the name of an event to hook into the action's lifecycle.