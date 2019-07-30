const AWS = require('aws-sdk');
const moment = require('moment');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;

exports.handler = async (event) => {
  try {
    var params = this.buildParams(event);
    var deviceList = await this.loadDeviceList(params);
    return {
      statusCode: 200,
      body: JSON.stringify(deviceList)
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500
    };
  }
};

exports.buildParams = (event) => {
  const startDate = event.queryStringParameters ? event.queryStringParameters.startDate : null;
  var limit = event.queryStringParameters ? event.queryStringParameters.limit : null;
  var params = {
    TableName: tableName,
    ProjectionExpression: 'deviceId'
  };

  if (startDate && moment(startDate, 'YYYY-MM-DD', true).isValid() && moment(startDate).isBefore()) {
    params.FilterExpression = 'lastUpdated between :startDate and :now';
    params.ExpressionAttributeValues = {
      ':startDate': moment(startDate).format(),
      ':now': moment().format()
    };
  }

  limit = parseInt(limit); // parseInt could yield NaN
  if (Number.isInteger(limit)) {
    params.Limit = limit;
  } else {
    params.Limit = 10; // Default limit
  }

  return params;
};

exports.loadDeviceList = async (params) => {
  var deviceList = await docClient.scan(params).promise();
  return deviceList.Items.map(device => {
    return device.deviceId;
  });
};
