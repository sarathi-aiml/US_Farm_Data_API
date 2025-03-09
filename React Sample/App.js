import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://api.usfarmdataservice.com'; // Replace with your actual API URL

function App() {
  // Authentication state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Request state
  const [customerId, setCustomerId] = useState('');
  const [gls, setGls] = useState('');
  const [requestId, setRequestId] = useState('');
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  // Criteria state (simplified, you might want to make this more dynamic)
  const [criteria, setCriteria] = useState({
    geo: {
      zip_no: 23330,
      City_no: 20085,
      county_code: 2706,
      STATE: 'IL'
    },
    crops: {
      CORNF: true,
      SOYBEANF: true,
      WHEATF: false
    },
    livestocks: {
      GOATSF: false,
      CATTLEF: true,
      CATTLEHEAD: '251 to 500',
      GOATSHEAD: null
    },
    acreage: {
      CORNACRE: 'E',
      WHEATACRE: null,
      SOYBEANACRE: 'C',
      TOTACRES: 'F'
    }
  });

  // Function to authenticate
  const authenticate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}/token`, formData);
      
      if (response.data && response.data.access_token) {
        setToken(response.data.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.access_token);
      }
    } catch (err) {
      setError('Authentication failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to upload criteria
  const uploadCriteria = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRequestId('');
    setStatus({});
    setResponse(null);
    
    try {
      const response = await axios.post(
        `${API_URL}/upload_criteria?customerid=${customerId}&GLS=${gls}`,
        criteria,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.request_id) {
        setRequestId(response.data.request_id);
      }
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check status
  const checkStatus = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `${API_URL}/get_status/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setStatus(response.data);
    } catch (err) {
      setError('Status check failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get response
  const getResponse = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `${API_URL}/get_response/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Check if we got an error response
      if (response.data && response.data.error) {
        setError(response.data.error);
        return;
      }
      
      setResponse(response.data);
    } catch (err) {
      setError('Getting response failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Check for saved token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="app-container">
      <h1>US Farm Data API Client</h1>
      
      {!isAuthenticated ? (
        <div className="auth-container">
          <h2>Authentication</h2>
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={authenticate}>
            <div className="form-group">
              <label>Username:</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="content-container">
          <div className="header">
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setToken('');
                localStorage.removeItem('token');
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
          
          <div className="upload-container">
            <h2>Upload Criteria</h2>
            {error && <div className="error">{error}</div>}
            
            <form onSubmit={uploadCriteria}>
              <div className="form-group">
                <label>Customer ID:</label>
                <input 
                  type="text" 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>GLS:</label>
                <input 
                  type="text" 
                  value={gls} 
                  onChange={(e) => setGls(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Criteria JSON:</label>
                <textarea 
                  value={JSON.stringify(criteria, null, 2)} 
                  onChange={(e) => {
                    try {
                      setCriteria(JSON.parse(e.target.value));
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={15}
                />
              </div>
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Upload Criteria'}
              </button>
            </form>
          </div>
          
          {requestId && (
            <div className="results-container">
              <h2>Request Results</h2>
              <p><strong>Request ID:</strong> {requestId}</p>
              
              <div className="actions">
                <button onClick={checkStatus} disabled={isLoading}>
                  {isLoading ? 'Checking...' : 'Check Status'}
                </button>
                
                <button onClick={getResponse} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Get Response'}
                </button>
              </div>
              
              {Object.keys(status).length > 0 && (
                <div className="status-result">
                  <h3>Status:</h3>
                  <p><strong>Status:</strong> {status.status}</p>
                  <p><strong>Message:</strong> {status.message}</p>
                  <p><strong>Can Download:</strong> {status.can_download ? 'Yes' : 'No'}</p>
                </div>
              )}
              
              {response && (
                <div className="response-result">
                  <h3>Response:</h3>
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;