'use strict';

const uuid = require('uuid');
const app = require('../index.js');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Test put-device', function () {
  var putDeviceStub;
  var generateUuidStub;
  const uuidv4 = uuid.v4();

  beforeEach(function () {
    putDeviceStub = sinon.stub(app, 'putDevice');
    generateUuidStub = sinon.stub(app, 'generateUuid').returns(uuidv4);
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
    sinon.assert.calledWithExactly(putDeviceStub, uuidv4, event.body);
    expect(result).to.be.deep.eq({ statusCode: 204 });
  });
});

describe('Test generateUuid function', function () {
  it('Verifies generation of uuid', async () => {
    const uuidv4 = app.generateUuid();
    expect(uuidv4).to.be.an('string');
    expect(uuidv4).to.has.lengthOf(36);
  });
});
