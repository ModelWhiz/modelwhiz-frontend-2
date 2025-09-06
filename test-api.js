// Test script to verify API connection
const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test evaluations endpoint
    const evalResponse = await fetch('http://localhost:8000/api/evaluations/?user_id=test');
    const evalData = await evalResponse.json();
    console.log('Evaluations:', evalData);
    
    // Test specific job status
    const statusResponse = await fetch('http://localhost:8000/api/evaluations/6/status');
    const statusData = await statusResponse.json();
    console.log('Job 6 status:', statusData);
    
    // Test job results
    const resultsResponse = await fetch('http://localhost:8000/api/evaluations/6/results');
    const resultsData = await resultsResponse.json();
    console.log('Job 6 results:', resultsData);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run the test
testAPI();
