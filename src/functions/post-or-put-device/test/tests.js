'use strict';

const uuidv1 = require('uuid/v1');
const app = require('../index.js');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Test put-device', function () {
  var putDeviceStub;
  var generateUuidStub;
  const uuid = uuidv1();

  beforeEach(function () {
    putDeviceStub = sinon.stub(app, 'putDevice');
    generateUuidStub = sinon.stub(app, 'generateUuid').returns(uuid);
  });

  afterEach(function () {
    putDeviceStub.restore();
    generateUuidStub.restore();
  });

  it('Verifies payload to DynamoDB SDK in case of update request', async () => {
    const event = {
      pathParameters: {
        deviceId: 'testId'
      },
      body: {
        name: 'testName',
        firmwareVersion: 'testFirmwareVersion',
        firmwareRevision: 'testFirmwareRevision'
      }
    };

    const result = await app.handler(event);
    sinon.assert.calledWithExactly(putDeviceStub, 'testId', event.body);
    expect(result).to.be.deep.eq({ statusCode: 204 });
  });

  it('Verifies payload to DynamoDB SDK in case of insert request', async () => {
    const event = {
      body: {
        name: 'testName',
        firmwareVersion: 'testFirmwareVersion',
        firmwareRevision: 'testFirmwareRevision'
      }
    };

    const result = await app.handler(event);
    sinon.assert.calledWithExactly(generateUuidStub);
    sinon.assert.calledWithExactly(putDeviceStub, uuid, event.body);
    expect(result).to.be.deep.eq({ statusCode: 204 });
  });
});

describe('Test generateUuid function', function () {
  it('Verifies generation of uuid', async () => {
    const uuid = app.generateUuid();
    expect(uuid).to.be.an('string');
    expect(uuid).to.has.lengthOf(36);
  });
});
