import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="brand">
          <svg className="brand-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          Gamizing
        </div>
        <div className="nav-links">
          {['Home', 'Leaderboard', 'Quests', 'Shop'].map((tab) => (
            <div 
              key={tab} 
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="user-profile">
          <span className="level-badge">Lvl 42</span>
          <button className="secondary">Profile</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Level Up Your <span className="text-accent">Experience</span></h1>
          <p className="hero-subtitle">
            Join the ultimate 2D multiplayer battleground. Compete with players worldwide, earn rewards, and climb to the top of the leaderboard.
          </p>
          <div className="hero-actions">
            <button className="btn">Play Now</button>
            <button className="btn secondary">View Quests</button>
          </div>
        </section>

        {/* Dashboard / Progress */}
        <h2 className="section-title">Your Progression</h2>
        <div className="dashboard-grid" style={{ marginBottom: '4rem' }}>
          <div className="card stat-card">
            <div className="stat-label">Current Rank</div>
            <div className="stat-value text-accent">Diamond II</div>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <div className="progress-labels">
                <span>750 LP</span>
                <span>1000 LP to Diamond I</span>
              </div>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Total XP Earned</div>
            <div className="stat-value">124,500</div>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '40%' }}></div>
              </div>
              <div className="progress-labels">
                <span>40% to Level 43</span>
                <span>2,500 XP remaining</span>
              </div>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">68.5%</div>
            <div className="progress-container">
              <div className="progress-labels" style={{ marginTop: '0.5rem' }}>
                <span className="text-accent">142 Wins</span>
                <span>65 Losses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements / Quests */}
        <h2 className="section-title">Recent Achievements</h2>
        <div className="dashboard-grid">
          <div className="card">
            <div className="achievement-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
            </div>
            <h3 className="achievement-title">First Blood</h3>
            <p className="achievement-desc">Secure the first elimination in a ranked competitive match.</p>
          </div>
          
          <div className="card">
            <div className="achievement-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <h3 className="achievement-title">Unstoppable</h3>
            <p className="achievement-desc">Win 5 consecutive ranked matches without losing a single round.</p>
          </div>

          <div className="card">
            <div className="achievement-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="achievement-title">Completionist</h3>
            <p className="achievement-desc">Finish all daily and weekly quests for 7 consecutive days.</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
