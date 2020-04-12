export default interface EventPayload<T> {
  readonly eventName: string;
  readonly data: Readonly<T>;
}
