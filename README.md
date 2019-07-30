# lambda-dynamodb-api-sam
A micro service which reads, writes and udpates data in a DynamoDB table.  Built with AWS SDK, SAM template,swagger and coded with Node.js.

# Data model
The DynamoDB table holds information about devices.  Each item of the table has following structure

```json
{
    "deviceId": "generated-uuid-string",
    "deviceInfo": {
      "firmwareRevision": "string",
      "firmwareVersion": "string",
      "name": "string"
    },
    "lastUpdated": "generated-timestamp-string"
}
```

# Deployment
Upon a commit to remote master branch, the repository changes are pushed to CodePipeline which contains 3 stages namely
1. Source - Code is being pushed
2. Build - Install dependencies, run linter and unit tests, creation of a cloud formation package
3. Deploy - Creation of resources based on `template.yaml`

The pipeline is created using a [build-pipeline](https://github.com/S-Polimetla/cloud-formation-templates/blob/master/build-pipeline.yaml)

# Schema Validation for API requests
The requests are validated at the API level before the lambda function is triggered.  This narrows down the possibility ofr ill-formed data entering while using POST request.

### Example:
If the POST body has 

```json
   {
      "firmwareRevision": 23,
      "firmwareVersion": "testVersion",
      "name": "testName"
    }
```

The above request would fail before reaching lambda since firmwareVersion is defined as a string and not integer

# Additional manual steps for Deployment
1. Creation of API Key and Usage Plan
2. Attaching a API stage to Usage Plan
3. Creation of S3 Bucket for storing the API documentation generated in CodeBuild and hosting it as a static website
