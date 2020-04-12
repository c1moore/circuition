import EventPayload from './event-payload';

type BeforeListener<T> = (payload: EventPayload<T>) => Promise<void>;

export default BeforeListener;
