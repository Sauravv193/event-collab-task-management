// Simple test script to check API connection
const API_URL = 'https://event-collab-task-management-2.onrender.com/api/v1';

async function testConnection() {
  console.log('🔍 Testing connection to:', API_URL);
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/../actuator/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health response:', healthData);
    }
    
    // Test a basic API endpoint
    console.log('\nTesting public events endpoint...');
    const eventsResponse = await fetch(`${API_URL}/events?page=0&size=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Events endpoint status:', eventsResponse.status);
    console.log('Events response headers:', Object.fromEntries(eventsResponse.headers.entries()));
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.text();
      console.log('Events response:', eventsData.substring(0, 200) + '...');
    } else {
      const errorText = await eventsResponse.text();
      console.log('Events error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testConnection();