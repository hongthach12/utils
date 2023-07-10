'use strict';
const AWS = require('aws-sdk');
const axios = require('axios');

AWS.config.update({ region: process.env.REGION });

//Services
const { sendEmailReport } = require('../services/sendEmailReport');

module.exports.readDomain = async (event) => {
  try {
    const result = [];
    const csvData = JSON.parse(event?.Records[0]?.body)?.csvData; 
    for (const domain of csvData) {
      const isBasicAuthEnabled = await checkBasicAuthSetting(domain);
      result.push({
        domain: domain.URL,
        isBasicAuthEnabled: isBasicAuthEnabled
      });
    }
    console.log(result);
    const emailSubject = 'Basic Auth Domain Check';
    const sendEmail = await sendEmailReport(emailSubject, result);
    console.log(sendEmail);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function checkBasicAuthSetting(domain) {
  try {
    const response = await axios.head(domain.URL, {
      timeout: 2000
    });
    return response?.status;
  } catch (error) {
    const statusError = error?.response?.status == null ? 500 : error?.response?.status;
    if(statusError == 500){
      return error?.status == null ? 'timeout or 500' : error?.status;
    } else {
      return statusError
    }
    
  }
}
