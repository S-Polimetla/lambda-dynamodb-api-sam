const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE;

exports.handler = async (event) => {
  const deviceId = event.pathParameters.deviceId;
  try {
    const deviceInfo = await this.loadDevice(deviceId);
    if (!deviceInfo) {
      return {
        statusCode: 404
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(deviceInfo)
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500
    };
  }
};

exports.loadDevice = async (deviceId) => {
  const params = {
    TableName: tableName,
    Key: {
      deviceId: deviceId
    }
  };

  const device = await docClient.get(params).promise();
  if (!device.Item || !device.Item.deviceInfo) return null;
  return device.Item.deviceInfo;
};
