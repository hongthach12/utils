const AWS = require('aws-sdk');

async function sendEmailReport(subject, body) {
    const ses = new AWS.SES({ region: process.env.REGION });

    let emailBody = '';
    let basicAuthEnabledDomains = [];
    let basicAuthDisabledDomains = [];
  
    for (const domain of body) {
      if (domain.isBasicAuthEnabled === 200) {
        basicAuthDisabledDomains.push(domain.domain);
      } else {
        basicAuthEnabledDomains.push(domain.domain);
      }
    }
  
    if (basicAuthDisabledDomains.length > 0) {
      emailBody += 'List domain not set Basic Auth:\n\n';
      emailBody += basicAuthDisabledDomains.join('\n');
    }
  
    if (basicAuthEnabledDomains.length > 0) {
      emailBody += '\n\nList domain set Basic Auth:\n\n';
      emailBody += basicAuthEnabledDomains.join('\n');
    }
  
    const params = {
      Destination: {
        ToAddresses: [process.env.CHANEL_EMAIL]
      },
      Message: {
        Body: {
          Text: { Data: emailBody }
        },
        Subject: { Data: subject }
      },
      Source: process.env.CHANEL_EMAIL
    };
  
    try {
      await ses.sendEmail(params).promise();
      return 'email sented';
    } catch (error) {
      return error;
    }
}

module.exports = {
  sendEmailReport
};
