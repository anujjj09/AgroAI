#!/usr/bin/env node

/**
 * Test Script for AgroAI Advisory System
 * 
 * This script tests the advisory API endpoint to ensure
 * weather integration, market analysis, and AI recommendations work correctly.
 */

const https = require('https');
const http = require('http');

// Test configuration
const config = {
  baseUrl: 'http://localhost:5000',
  testCrop: 'wheat',
  testLocation: 'Ludhiana',
  // Add a test JWT token here if needed
  testToken: 'test-token-or-use-guest-mode'
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('📊 Server info:', response.data);
      return true;
    } else {
      console.log('❌ Health check failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testWeatherAPI() {
  console.log('🌤️  Testing weather API...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/weather/${config.testLocation}`,
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Weather API working');
      console.log('🌡️  Temperature:', response.data.weather.temperature + '°C');
      console.log('💧 Humidity:', response.data.weather.humidity + '%');
      return true;
    } else {
      console.log('❌ Weather API failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Weather API error:', error.message);
    return false;
  }
}

async function testMarketAPI() {
  console.log('📈 Testing market API...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/market/${config.testLocation}`,
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Market API working');
      console.log('💰 Sample prices:', response.data.prices.slice(0, 2));
      return true;
    } else {
      console.log('❌ Market API failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Market API error:', error.message);
    return false;
  }
}

async function testAdvisoryAPI() {
  console.log('🤖 Testing advisory API...');
  
  try {
    const requestData = {
      crop: config.testCrop,
      location: config.testLocation
    };
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/advisory',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.testToken}`
      }
    }, requestData);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Advisory API working');
      console.log('📋 Immediate actions:', response.data.advisory.immediateActions.length, 'items');
      console.log('📅 Long-term strategy:', response.data.advisory.longTermStrategy.length, 'items');
      console.log('💡 Financial insight:', response.data.advisory.financialInsight.substring(0, 100) + '...');
      
      // Validate data structure
      const required = ['weather', 'forecast', 'market'];
      const hasAllData = required.every(key => response.data.data[key]);
      
      if (hasAllData) {
        console.log('✅ All data components present');
        return true;
      } else {
        console.log('⚠️  Missing data components');
        return false;
      }
    } else {
      console.log('❌ Advisory API failed:', response.statusCode, response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Advisory API error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting AgroAI Advisory System Tests\n');
  console.log('=' * 50);
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Weather API', fn: testWeatherAPI },
    { name: 'Market API', fn: testMarketAPI },
    { name: 'Advisory API', fn: testAdvisoryAPI }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} crashed:`, error.message);
      failed++;
    }
    console.log(''); // Add spacing
  }
  
  console.log('=' * 50);
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Advisory system is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Start your backend server: npm start');
  console.log('2. Start your frontend: cd client && npm start');
  console.log('3. Test the advisory feature in the web interface');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
AgroAI Advisory System Test Script

Usage:
  node test-advisory.js [options]

Options:
  --help, -h     Show this help message
  --url URL      Set base URL (default: ${config.baseUrl})
  --crop CROP    Set test crop (default: ${config.testCrop})
  --location LOC Set test location (default: ${config.testLocation})

Examples:
  node test-advisory.js
  node test-advisory.js --crop rice --location Amritsar
  node test-advisory.js --url http://localhost:3001
  `);
  process.exit(0);
}

// Parse command line arguments
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  config.baseUrl = process.argv[urlIndex + 1];
}

const cropIndex = process.argv.indexOf('--crop');
if (cropIndex !== -1 && process.argv[cropIndex + 1]) {
  config.testCrop = process.argv[cropIndex + 1];
}

const locationIndex = process.argv.indexOf('--location');
if (locationIndex !== -1 && process.argv[locationIndex + 1]) {
  config.testLocation = process.argv[locationIndex + 1];
}

// Run the tests
runTests().catch(error => {
  console.error('🚨 Test runner crashed:', error);
  process.exit(1);
});