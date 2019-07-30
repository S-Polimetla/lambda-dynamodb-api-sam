'use strict';

const app = require('../index.js');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Test buildParams', function () {
  it('Verifies successful params building with custom limit and startDate', () => {
    const event = {
      queryStringParameters: {
        limit: '25', // QueryParameters are received as strings from API Gateway
        startDate: '2019-01-01'
      }
    };

    const params = app.buildParams(event);
    expect(params.Limit).to.be.eq(25);

    // Do not use equal since the timestamp produced by index.js could vary by a few ms causing the test to fail occasionally
    expect(params.ExpressionAttributeValues).to.have.property(':startDate');
    expect(params.ExpressionAttributeValues).to.have.property(':now');
    expect(params.FilterExpression).to.be.eq('lastUpdated between :startDate and :now');
  });

  it('Verifies successful params building with no limit and no startDate', () => {
    const event = {};
    const params = app.buildParams(event);
    expect(params.Limit).to.be.eq(10);
    expect(params).to.not.have.property('FilterExpression');
    expect(params).to.not.have.property('ExpressionAttributeValues');
  });

  it('Verifies params response with no limit and in valid startDate format', () => {
    const event = {
      queryStringParameters: {
        startDate: 'something'
      }
    };
    const params = app.buildParams(event);
    expect(params.Limit).to.be.eq(10);
    expect(params).to.not.have.property('FilterExpression');
    expect(params).to.not.have.property('ExpressionAttributeValues');
  });

  it('Verifies params response with invalid limit and no startDate', () => {
    const event = {
      queryStringParameters: {
        limit: 'something'
      }
    };
    const params = app.buildParams(event);
    expect(params.Limit).to.be.eq(10);
    expect(params).to.not.have.property('FilterExpression');
  });

  it('Verifies params response with a future startDate', () => {
    const event = {
      queryStringParameters: {
        startDate: '3000-01-01' // Future date
      }
    };
    const params = app.buildParams(event);
    expect(params.Limit).to.be.eq(10);
    expect(params).to.not.have.property('FilterExpression');
    expect(params).to.not.have.property('ExpressionAttributeValues');
  });
});

describe('Test list-devices', function () {
  var loadDeviceListStub;
  const deviceList = ['id1', 'id2'];

  beforeEach(function () {
    loadDeviceListStub = sinon.stub(app, 'loadDeviceList');
  });

  afterEach(function () {
    loadDeviceListStub.restore();
  });

  it('Verifies successful response', async () => {
    const event = {
      queryStringParameters: {
        limit: 25,
        startDate: '2019-01-01'
      }
    };

    const params = app.buildParams(event);
    loadDeviceListStub.returns(deviceList);
    const result = await app.handler(event);
    sinon.assert.calledWithExactly(loadDeviceListStub, params);
    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    const response = JSON.parse(result.body);
    expect(response).to.be.an('array');
  });
});
