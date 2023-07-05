const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
exports.handler = async (event, context) => {
  try {
    
    const sqs = new AWS.SQS(); 

    // Lấy URL của SQS queue từ tên queue
    const queueName = process.env.QUEUE_NAME;
    const getQueueUrlParams = {
      QueueName: queueName,
    };
    const queueUrlResponse = await sqs.getQueueUrl(getQueueUrlParams).promise();
    const queueUrl = queueUrlResponse.QueueUrl;

    const messageParams = {
      MessageBody: 'REPORT_DOMAIN',
      QueueUrl: queueUrl,
    };

    const result = await sqs.sendMessage(messageParams).promise();

    return {
      statusCode: 200,
      body: 'Report Successful, Please Wait For Email Sent To chanel',
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: 'Failed to request Report',
    };
  }
};
