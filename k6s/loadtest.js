import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');
export let dbInsertLatency = new Trend('db_insert_latency');
export let healthCheckLatency = new Trend('health_check_latency');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 20 },   // Ramp up to 20 users
    { duration: '5m', target: 20 },   // Stay at 20 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests must complete below 2s
    'http_req_failed': ['rate<0.05'],     // Error rate must be below 5%
    'errors': ['rate<0.1'],               // Custom error rate below 10%
  },
};

// Configuration - Update with your EC2 public IP
const BASE_URL = __ENV.TARGET_URL || 'http://18.136.197.156:3000';

// Sample data for POST requests
const sampleUsers = [
  { name: 'Alice Johnson', email: 'alice@test.com', message: 'Load testing with k6' },
  { name: 'Bob Smith', email: 'bob@test.com', message: 'Testing database performance' },
  { name: 'Carol Davis', email: 'carol@test.com', message: 'Monitoring application under load' },
  { name: 'David Wilson', email: 'david@test.com', message: 'Stress testing the API' },
  { name: 'Emma Brown', email: 'emma@test.com', message: 'Performance testing scenario' },
];

export default function() {
  // Test scenarios with different weights
  let scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Health check requests
    healthCheck();
  } else if (scenario < 0.6) {
    // 30% - GET data requests
    getData();
  } else {
    // 40% - POST data requests (most database intensive)
    postData();
  }
  
  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

function healthCheck() {
  let response = http.get(`${BASE_URL}/health`);
  
  let result = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
    'health check has correct status': (r) => {
      try {
        return JSON.parse(r.body).status === 'healthy';
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!result);
  healthCheckLatency.add(response.timings.duration);
}

function getData() {
  let response = http.get(`${BASE_URL}/data`);
  
  let result = check(response, {
    'get data status is 200': (r) => r.status === 200,
    'get data response time < 1000ms': (r) => r.timings.duration < 1000,
    'get data returns array': (r) => {
      try {
        let body = JSON.parse(r.body);
        return body.success && Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!result);
}

function postData() {
  // Select random user data
  let userData = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
  
  // Add timestamp to make each request unique
  userData.message = `${userData.message} - ${new Date().toISOString()}`;
  
  let payload = JSON.stringify(userData);
  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  let response = http.post(`${BASE_URL}/data`, payload, params);
  
  let result = check(response, {
    'post data status is 201': (r) => r.status === 201,
    'post data response time < 2000ms': (r) => r.timings.duration < 2000,
    'post data returns success': (r) => {
      try {
        let body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!result);
  dbInsertLatency.add(response.timings.duration);
}

export function handleSummary(data) {
  return {
    'loadtest-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========== LOAD TEST SUMMARY ==========
    
    🚀 Total Requests: ${data.metrics.http_reqs.values.count}
    📊 Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s
    
    ⏱️  Response Times:
       • Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
       • 90th percentile: ${data.metrics.http_req_duration.values['p(90)'].toFixed(2)}ms
       • 95th percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
       • 99th percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
    
    ❌ Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
    
    🗄️  Database Performance:
       • Insert P90: ${data.metrics.db_insert_latency?.values['p(90)']?.toFixed(2) || 'N/A'}ms
       • Insert P95: ${data.metrics.db_insert_latency?.values['p(95)']?.toFixed(2) || 'N/A'}ms
    
    🏥 Health Check Performance:
       • Average: ${data.metrics.health_check_latency?.values.avg?.toFixed(2) || 'N/A'}ms
    
    =====================================
    `,
  };
}