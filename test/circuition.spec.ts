import { Circuition } from '../src';
import { should } from 'chai';
import Sinon, { SinonStub } from 'sinon';

const oughta = should();

describe('Circuition', () => {
  let circuition: Circuition;

  beforeEach(() => {
    circuition = new Circuition();
  });

  describe('registerBeforeListener', () => {
    it('should throw an error if the event has not been registered', () => {
      oughta.throw(() => circuition.registerBeforeListener('dne', async () => {}));
    });
  });

  describe('registerAfterListener', () => {
    it('should throw an error if the event has not been registered', () => {
      oughta.throw(() => circuition.registerAfterListener('dne', async () => {}));
    });
  });

  describe('invokeEvent', () => {
    type Payload = {};

    const eventName = 'subject:event';
    let data: Payload;

    let eventHandler: SinonStub;

    beforeEach(() => {
      data = {};
      eventHandler = Sinon.stub();

      circuition.registerEvent<Payload>(eventName, eventHandler);
    });

    it('should throw an error if the event has not been registered', async () => {
      return circuition.invokeEvent<any>({ eventName: `${eventName}_dne`, data: {} }).should.be.rejected;
    });

    it('should cancel the event if a before listener throws an error', async () => {
      circuition.registerBeforeListener<Payload>(eventName, async () => {
        throw new Error()
      });

      await circuition.invokeEvent<Payload>({ eventName, data });

      Sinon.assert.notCalled(eventHandler);
    });

    it('should not execute after listeners if the event fails', async () => {
      const afterListener = Sinon.stub();

      eventHandler.throws(new Error());
      circuition.registerAfterListener<Payload>(eventName, afterListener);

      try {
        await circuition.invokeEvent<Payload>({ eventName, data });
      } catch {}

      Sinon.assert.notCalled(afterListener);
    });

    it('should execute all after listeners even if one throws an error', async () => {
      const afterListeners = [
        Sinon.stub(),
        Sinon.stub().throws(new Error()),
        Sinon.stub(),
        Sinon.stub(),
      ];

      afterListeners.forEach((afterListener) => circuition.registerAfterListener<Payload>(eventName, afterListener));

      await circuition.invokeEvent<Payload>({ eventName, data });

      afterListeners.forEach((afterListener) => Sinon.assert.calledOnce(afterListener));
    });

    it('should execute the full event lifecycle', async () => {
      const beforeListeners = [
        Sinon.stub(),
        Sinon.stub(),
        Sinon.stub(),
      ];

      const afterListeners = [
        Sinon.stub(),
        Sinon.stub(),
        Sinon.stub(),
      ];

      beforeListeners.forEach(beforeListener => circuition.registerBeforeListener(eventName, beforeListener));
      afterListeners.forEach(AfterListener => circuition.registerAfterListener(eventName, AfterListener));

      await circuition.invokeEvent({ eventName, data });

      beforeListeners.forEach((beforeListener) => Sinon.assert.calledOnce(beforeListener));
      afterListeners.forEach((afterListener) => Sinon.assert.calledOnce(afterListener));
    });

    it('should throw the error thrown by the event handler', async () => {
      const error = new Error();
      eventHandler.throws(error);

      return circuition.invokeEvent<Payload>({ eventName, data }).should.be.rejectedWith(error);
    });
  });
});