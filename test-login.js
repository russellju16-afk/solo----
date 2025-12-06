import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    const response = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: '123456'
    });
    
    console.log('✓ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User Info:', response.data.userInfo);
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testLogin();