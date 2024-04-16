const axios = require('axios');

const accessToken = process.env.WA_CLOUD_TOKEN;;
const phoneNumberId = '268249643045859';

const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/conversational_automation`;

const data = {
  enable_welcome_message: true, // atau false
  commands: [{
    command_name: "latestflights",
    command_description: "Latest Flights"
  }],
  prompts: ["Book a flight", "plan a vacation"]
};

const config = {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
};

axios.post(url, data, config)
  .then((response) => {
    console.log('Response:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
