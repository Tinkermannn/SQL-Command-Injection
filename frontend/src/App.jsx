import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000/api'

function App() {
  const [activeTab, setActiveTab] = useState('search')
  
  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginResult, setLoginResult] = useState(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  
  // User lookup state
  const [userId, setUserId] = useState('')
  const [userResult, setUserResult] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginResult(null)
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      setLoginResult(data)
    } catch (error) {
      setLoginResult({ success: false, message: error.message })
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setSearchResults(null)
    
    try {
      const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      setSearchResults({ success: false, message: error.message })
    }
  }

  const handleUserLookup = async (e) => {
    e.preventDefault()
    setUserResult(null)
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}`)
      const data = await response.json()
      setUserResult(data)
    } catch (error) {
      setUserResult({ success: false, message: error.message })
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>TechStore</span>
          </div>
          <div className="nav-links">
            <button 
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => setActiveTab('search')}
            >
              Products
            </button>
            <button 
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={activeTab === 'user' ? 'active' : ''}
              onClick={() => setActiveTab('user')}
            >
              Account
            </button>
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to TechStore</h1>
          <p>Your one-stop shop for premium tech products</p>
        </div>
      </div>

      <div className="content">
        {activeTab === 'search' && (
          <div className="section">
            <div className="section-header">
              <h2>Browse Products</h2>
              <p>Search our extensive catalog of premium tech products</p>
            </div>
            <div className="search-bar">
              <form onSubmit={handleSearch}>
                <div className="search-input-group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                  />
                  <button type="submit" className="btn-primary">Search</button>
                </div>
              </form>
            </div>
            
            {searchResults && (
              <div className="products-grid">
                {searchResults.results && searchResults.results.length > 0 ? (
                  searchResults.results.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="product-footer">
                          <span className="price">${product.price}</span>
                          <button className="btn-secondary">Add to Cart</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : searchResults.success ? (
                  <div className="no-results">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>No products found</p>
                  </div>
                ) : (
                  <div className="error-message">
                    <p>{searchResults.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'login' && (
          <div className="section">
            <div className="section-header">
              <h2>Member Login</h2>
              <p>Access your account to view orders and profile</p>
            </div>
            <div className="card">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </form>
              <div className="form-footer">
                <a href="#">Forgot password?</a>
                <span>•</span>
                <a href="#">Create account</a>
              </div>
            </div>
            
            {loginResult && (
              <div className={`result ${loginResult.success ? 'success' : 'error'}`}>
                <h3>{loginResult.success ? '✅ Success!' : '❌ Failed'}</h3>
                <pre>{JSON.stringify(loginResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'user' && (
          <div className="section">
            <div className="section-header">
              <h2>My Account</h2>
              <p>View and manage your account information</p>
            </div>
            <div className="card">
              <form onSubmit={handleUserLookup}>
                <div className="form-group">
                  <label>Account ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter account ID"
                  />
                </div>
                <button type="submit" className="btn-primary">View Account</button>
              </form>
            </div>
            
            {userResult && userResult.user && (
              <div className="card account-info">
                <div className="account-header">
                  <div className="avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3>{userResult.user.username}</h3>
                    <span className={`badge ${userResult.user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {userResult.user.role}
                    </span>
                  </div>
                </div>
                <div className="account-details">
                  <div className="detail-row">
                    <span className="label">Email</span>
                    <span className="value">{userResult.user.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">User ID</span>
                    <span className="value">#{userResult.user.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Member Since</span>
                    <span className="value">{userResult.user.created_at || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
