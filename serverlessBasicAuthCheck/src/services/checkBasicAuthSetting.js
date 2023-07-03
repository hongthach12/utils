
const axios = require('axios');
async function checkBasicAuthSetting(domain) {
    try {
      const response = await axios.get(domain.URL, {
        timeout: 10000 
      });
      
      return response.status;
    } catch (error) {
      return error.response.status;
    }
}

module.exports = {
    checkBasicAuthSetting
};
