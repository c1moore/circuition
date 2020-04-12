import EventPayload from './event-payload';

type Event<T> = (event: EventPayload<T>) => Promise<void>;

export default Event;
