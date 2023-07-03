
const axios = require('axios');
async function checkBasicAuthSetting(domain) {
    try {
      const response = await axios.head(domain.URL, {
        timeout: 1000
      });
      
      return response?.status;
    } catch (error) {
      return error.status == null ? '500 timeout': error?.status;
    }
}

module.exports = {
    checkBasicAuthSetting
};
