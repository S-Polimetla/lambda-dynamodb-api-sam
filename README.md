# lambda-dynamodb-api-sam
A micro service which reads, writes and updates data in a DynamoDB table.  Built with AWS SDK, SAM template,swagger and coded with Node.js.

*Disclaimer - This project should be considered a POC or a tutorial. If you decided to run this on production systems you do so at your own risk.*

## Data model
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

## Deployment Work Flow

The pipeline is created using a [build-serverless-pipeline](./build-pipeline-serverless.yaml). Simply create a stack with this file via CloudFormation Console or using CLI.  This file is generic and can be used for similar purposes.

1. The value of ProjectName should be the same as `Service` in the Parameters mentioned.
2. The name of the S3 Bucket mentioned in the `config.json` should be the same as the one created by the `build-pipeline` stack.
3. Uploading `build-serverless-pipeline` creates a stack which creates a CodePipeline
4. This pipeline listens to changes done to the `master` branch.  Upon every commit the code is fetched into the pipeline in the first phase of the pipeline `Source`
5. In the step step namely, Build - the dependencies are installed.
6. In my implementation, I am also running unit tests and linter as a way to ensure well tested implementation and to enforce clean code principles.  To skip this step, you may comment out the respective lines of code in [build.sh](./build.sh)
7. During the Deploy stage of the pipeline, a change set is first created which validates `template.yaml` first before creating or updating resources.  This can be skipped as well but I would recommend to keep this as it would inform you about any errors with `template.yaml` right away than throwing errors while creating the stack.
8. In the second step of Deploy Stage, another CloudFormation stack is created based on `template.yaml`.  This creates all the resources mentioned in the template.  Please note, that I have referred to `swagger.yaml` in the `template.yaml` to create API Gateway since it is a elegant way and also to enforce security features and request validation.  You may chose to map Events to your lambda function if you choose not to use swagger.
9. SAM currently does not support creation of Usage Plans which are useful to secure your API with a API-Key.  Refer [Feature-Request](https://github.com/awslabs/serverless-application-model/issues/248).  This can be created either by traditional CloudFormation configuration or manually.
10. I have created them manually in my implementation (hardly 5 min work). Create a API Key and Usage Plan. Attach the API Key to a Usage Plan which should be attached to stage of the API created. (In my case `dev`)

## Schema Validation for API requests
The requests are validated at the API level before the lambda function is triggered.  This narrows down the possibility of ill-formed data entering via POST request.

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