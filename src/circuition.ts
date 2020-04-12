import AfterListener from './after-listener';
import BeforeListener from './before-listener';
import Event from './event';
import EventPayload from './event-payload';

type RegisteredEvent<T> = {
  before: BeforeListener<T>[];
  after: AfterListener<T>[];
  event: Event<T>;
};

type RegisteredEvents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [ eventName: string ]: RegisteredEvent<any>;
};

type Logger = { debug: (...args: unknown[]) => void };

export default class Circuition {
  private readonly events: RegisteredEvents = {};

  private readonly logger: Logger;

  private readonly showLogs: boolean;

  constructor(showLogs = false, logger: Logger = console) {
    this.showLogs = showLogs;
    this.logger = logger;
  }

  registerEvent<T>(eventName: string, event: Event<T>): void {
    this.events[eventName] = {
      before: [],
      after: [],
      event,
    };
  }

  registerBeforeListener<T>(eventName: string, listener: BeforeListener<T>): void {
    const registeredEvent = this.getRegisteredEvent<T>(eventName);

    registeredEvent.before.push(listener);
  }

  registerAfterListener<T>(eventName: string, listener: AfterListener<T>): void {
    const registeredEvent = this.getRegisteredEvent<T>(eventName);

    registeredEvent.after.push(listener);
  }

  async invokeEvent<T>(payload: EventPayload<T>): Promise<void> {
    const registeredEvent = this.getRegisteredEvent<T>(payload.eventName);

    if (!await this.executeBeforeListeners(registeredEvent.before, payload)) {
      return;
    }

    await registeredEvent.event(payload);

    await this.executeAfterListeners(registeredEvent.after, payload);
  }

  private getRegisteredEvent<T>(eventName: string): RegisteredEvent<T> {
    const registeredEvent = this.events[eventName];

    if (!registeredEvent) {
      throw new Error('Event not registered.');
    }

    return registeredEvent;
  }

  private async executeBeforeListeners<T>(
    beforeListeners: BeforeListener<T>[],
    payload: EventPayload<T>,
  ): Promise<boolean> {
    const results = await Promise.all(
      beforeListeners.map(
        (beforeListener): Promise<boolean> => this.executeBeforeListener(beforeListener, payload),
      ),
    );

    return !results.includes(false);
  }

  private async executeBeforeListener<T>(
    beforeListener: BeforeListener<T>,
    payload: EventPayload<T>,
  ): Promise<boolean> {
    try {
      await beforeListener(payload);

      return true;
    } catch (err) {
      if (this.showLogs) {
        this.logger.debug(`Before listener for event ${payload.eventName} threw error.  Error: ${(err instanceof Error) ? err.message : err}`);
      }

      return false;
    }
  }

  private async executeAfterListeners<T>(
    afterListeners: AfterListener<T>[],
    payload: EventPayload<T>,
  ): Promise<void> {
    await Promise.all(
      afterListeners.map(
        (afterListener) => this.executeAfterListener(afterListener, payload),
      ),
    );
  }

  private async executeAfterListener<T>(
    afterListener: AfterListener<T>,
    payload: EventPayload<T>,
  ): Promise<void> {
    try {
      await afterListener(payload);
    } catch (err) {
      if (!this.showLogs) {
        return;
      }

      this.logger.debug(`After listener failed for event ${payload.eventName}.  Error: ${(err instanceof Error) ? err.message : err}`);
    }
  }
}
