'use strict';
const AWS = require('aws-sdk');
const csvParser = require('csv-parser');

AWS.config.update({ region: process.env.REGION });

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;
const keyFileDomain = process.env.S3_FILE_DOMAIN_NAME;

//Services
const { sendEmailReport } = require('../services/sendEmailReport');
const { checkBasicAuthSetting } = require('../services/checkBasicAuthSetting');

module.exports.readDomain = async (event) => {

  const getObjectParams = {
    Bucket: bucketName,
    Key: keyFileDomain
  };

  try {
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

    const result = [];
    
    for (const domain of csvData) {
      const isBasicAuthEnabled = await checkBasicAuthSetting(domain);
      result.push({
        domain: domain.URL,
        isBasicAuthEnabled: isBasicAuthEnabled
      });
    }

    const emailSubject = 'Basic Auth Domain Check';
    const resultSendMail =  await sendEmailReport(emailSubject, result);

    return {
      statusCode: 200,
      result,
      resultSendMail
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to read CSV file from S3',
        message: error.message
      })
    };
  }
};
