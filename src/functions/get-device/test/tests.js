'use strict';

const app = require('../index.js');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Test get-device', function () {
  var loadDeviceStub;
  const jsonResponse = {
    name: 'testDevice',
    firmwareVersion: 'testVersion',
    firmwareRevision: 'testRevision'
  };

  beforeEach(function () {
    loadDeviceStub = sinon.stub(app, 'loadDevice');
  });

  afterEach(function () {
    loadDeviceStub.restore();
  });

  it('Verifies response in case device found', async () => {
    const event = {
      pathParameters: {
        deviceId: 'testId'
      }
    };

    loadDeviceStub.returns(jsonResponse);
    const result = await app.handler(event);
    sinon.assert.calledWithExactly(loadDeviceStub, 'testId');
    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(201);
    const response = JSON.parse(result.body);
    expect(response).to.be.an('object');
    expect(response).to.be.deep.eq(jsonResponse);
  });

  it('Verifies response in case no matching record found', async () => {
    const event = {
      pathParameters: {
        deviceId: 'testId'
      }
    };

    loadDeviceStub.returns(null);
    const result = await app.handler(event);
    sinon.assert.calledWithExactly(loadDeviceStub, 'testId');
    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(404);
    expect(result).to.be.deep.eq({ statusCode: 404 });
  });
});
