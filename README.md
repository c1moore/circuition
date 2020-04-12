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
import { Circuition, Payload } from 'circuition';

const circuition = new Circuition();
```

JavaScript
```javascript
const { Circuition } = require('circuition');

const circuition = new Circuition();
```

### `registerEvent<T>(eventName: string, eventHandler: (payload: Payload<T>) => Promise<any>): void`
Registers a new event and the handler that is executed when the event is invoked.  Events must be registered before calling any other method on Circuition or an error will be thrown.

#### Parameters
- `eventName` - the name of the event
- `eventHandler` - the handler that performs the desired action when the event is fired

#### Example
```typescript
circuition.registerEvent<FormData>('form:submit', async (payload: Payload<FormData>): Promise<void> => {
  await fetch(url, {
    method: 'POST',
    body:   JSON.stringify(payload.data),
  });
});
```

### `registerBeforeListener<T>(eventName: string, listener: async (payload: Payload<T>) => Promise<void>): void`
Registers a new before listener for the specified event.  Before listeners can cancel an event by throwing an error (rejecting the returned Promise).  All before listeners for an event execute in parallel, so order is not guaranteed.

#### Parameters
- `eventName` - the name of the event to which the listener should be added
- `listener` - the function that will be executed before the event is fired

#### Example
```typescript
circuition.registerBeforeListener<FormData>('form:submit', async (payload: Payload<FormData>): Promise<void> => {
  // Check if the email is valid.
  if (!emailRegex.test(payload.data?.email)) {
    throw new Error('Invalid Email');
  }
});

circuition.registerBeforeListener<FormData>('form:submit', async (payload: Payload<FormData>): Promise<void> => {
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

### `registerAfterListener<T>(eventName: string, listener: async (payload: Payload<T>) => Promise<void>): void`
Registers a new after listener for the specified event.  After listeners are only executed if the event as fired and successfully completed.  All after listeners for an event execute in parallel, so order is not guaranteed.

#### Parameters
- `eventName` - the name of the event to which the listener should be added
- `listener` - the function that will be executed after the event has successfully completed

#### Example
```typescript
circuition.registerAfterListener<FormData>('form:submit', async (payload: Payload<FormData>): Promise<void> => {
  window.location.replace(accountPage);
});

circuition.registerAfterListener<FormData>('form:submit', async (payload: Payload<FormData>): Promise<void> => {
  await externalTracker.track('signup', payload.data);
});
```

## Testing
To run the tests for this project, just execute

```bash
npm test
```

To see a coverage report, check at the [Codecov report](https://codecov.io/gh/c1moore/circuition).

## Contributing
<!-- Do you accept contributions?  Cool, let people know how to contribute to the project. -->