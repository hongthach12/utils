const AWS = require('aws-sdk');
const csvParser = require('csv-parser');
AWS.config.update({ region: process.env.REGION });

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;
const keyFileDomain = process.env.S3_FILE_DOMAIN_NAME;
exports.handler = async (event, context) => {
  try {
    
    const sqs = new AWS.SQS(); 
    const getObjectParams = {
      Bucket: bucketName,
      Key: keyFileDomain
    };

    const s3Stream = s3.getObject(getObjectParams).createReadStream();

    const csvData = [];
    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csvParser())
        .on('data', (data) => {
          csvData.push(data);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

   
    const queueName = process.env.QUEUE_NAME;
    const getQueueUrlParams = {
      QueueName: queueName,
    };
    const queueUrlResponse = await sqs.getQueueUrl(getQueueUrlParams).promise();
    const queueUrl = queueUrlResponse.QueueUrl;

    const messageParams = {
      MessageBody: JSON.stringify({
        csvData,
        key: "REPORT_KEY"
      }),
      QueueUrl: queueUrl,
    };

    const result = await sqs.sendMessage(messageParams).promise();

    return result;
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500
    };
  }
};
