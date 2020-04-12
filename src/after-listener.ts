import EventPayload from './event-payload';

type AfterListener<T> = (payload: EventPayload<T>) => Promise<void>;

export default AfterListener;
