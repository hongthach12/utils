'use strict';
const { createObjectCsvWriter } = require('csv-writer');
const AWS = require('aws-sdk');
const { Readable } = require('stream');

AWS.config.update({ region: process.env.REGION });

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

module.exports.uploadDomain = async (event) => {
  
  const requestData = event?.body;

  const csvData = [];
  for (const url of requestData) {
    const rowData = {
      URL: url
    };
    csvData.push(rowData);
  }

  const csvWriter = createObjectCsvWriter({
    path: '/tmp/output.csv',
    header: [
      { id: 'URL', title: 'URL' },
    ]
  });

  await csvWriter.writeRecords(csvData);

  const fileContent = require('fs').readFileSync('/tmp/output.csv');
  const readableStream = new Readable();
  readableStream._read = () => {};
  readableStream.push(fileContent);
  readableStream.push(null);

  const uploadParams = {
    Bucket: bucketName,
    Key: process.env.S3_FILE_DOMAIN_NAME,
    Body: readableStream
  };

  try {
    await s3.upload(uploadParams).promise();
    return {
      statusCode: 200
    };
  } catch (error) {
    return {
      statusCode: 500
    };
  }
};
