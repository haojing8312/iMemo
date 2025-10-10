// Simple test script for Gemini API
// Run with: node test-gemini-api.js

const axios = require('axios');

const API_KEY = 'AIzaSyBwHfrtd7Eb1nw9QXi1VxBGeH0FqzRH1Nc';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.5-flash-image';

async function testGeminiAPI() {
  console.log('Testing Gemini API connection...\n');

  try {
    const response = await axios.post(
      `${BASE_URL}/models/${MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [
              { text: 'Generate a simple test image of a cute baby' }
            ]
          }
        ]
      },
      {
        params: { key: API_KEY },
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    console.log('✅ API Connection Successful!\n');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');

    // Check if image data is present
    const candidate = response.data.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(part => part.inline_data);

    if (imagePart?.inline_data?.data) {
      console.log('\n✅ Image data received (base64 length:', imagePart.inline_data.data.length, 'chars)');
    } else {
      console.log('\n❌ No image data in response');
    }

  } catch (error) {
    console.error('❌ API Test Failed:\n');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received');
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGeminiAPI();
