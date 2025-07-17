import React, { useState } from 'react';
import { Dumbbell, Heart, Zap, Trophy, Gamepad2, Home, BarChart } from 'lucide-react';

const StyleGuideDemo = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
    setTimeout(() => setSelectedButton(null), 200);
  };

  return (
    <div className="style-demo">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Press Start 2P', monospace;
          background: #0D0D0D;
          color: #FFFFFF;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .style-demo {
          max-width: 375px;
          margin: 0 auto;
          min-height: 100vh;
          background: #1A1A1A;
        }
        
        /* Screen Container */
        .screen-container {
          background: #0D0D0D;
          border: 8px solid #2A2A2A;
          border-radius: 24px;
          margin: 20px;
          padding: 0;
          overflow: hidden;
          box-shadow: 
            inset 0 0 20px rgba(0,0,0,0.5),
            0 8px 16px rgba(0,0,0,0.3);
        }
        
        /* Header */
        .game-header {
          background: #1A1A1A;
          padding: 16px;
          text-align: center;
          border-bottom: 4px solid #2A2A2A;
        }
        
        .logo {
          color: #F7D51D;
          font-size: 24px;
          text-shadow: 2px 2px 0 #000;
          letter-spacing: 2px;
        }
        
        /* Character Arena */
        .character-arena {
          background: linear-gradient(
            to bottom,
            #5C94FC 0%,
            #7BA7FC 60%,
            #8B7355 60%,
            #6B5745 100%
          );
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .scanline-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          );
          pointer-events: none;
        }
        
        .character-placeholder {
          font-size: 80px;
          z-index: 1;
          animation: idle 2s ease-in-out infinite;
        }
        
        @keyframes idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        /* Action Panel */
        .action-panel {
          background: #1A1A1A;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        /* Buttons */
        .btn-primary {
          background: #92CC41;
          color: #0D0D0D;
          border: 4px solid #0D0D0D;
          padding: 16px;
          font-size: 10px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 4px 4px 0px #0D0D0D;
          transition: transform 50ms, box-shadow 50ms;
          font-family: 'Press Start 2P', monospace;
        }
        
        .btn-primary:active,
        .btn-primary.active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #0D0D0D;
        }
        
        .btn-primary:disabled {
          background: #636363;
          cursor: not-allowed;
        }
        
        .btn-food {
          background: #F7D51D;
        }
        
        .btn-error {
          background: #E53935;
          color: #FFFFFF;
        }
        
        /* Stats Section */
        .stats-section {
          background: #1A1A1A;
          padding: 20px;
        }
        
        .stat-item {
          margin-bottom: 16px;
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 10px;
        }
        
        .stat-bar {
          height: 16px;
          background: #000;
          border: 2px solid #000;
          position: relative;
          overflow: hidden;
        }
        
        .stat-bar-fill {
          height: 100%;
          background-image: repeating-linear-gradient(
            90deg,
            currentColor 0,
            currentColor 8px,
            transparent 8px,
            transparent 10px
          );
          transition: width 300ms;
        }
        
        .stat-bar-health { color: #E53935; }
        .stat-bar-stamina { color: #FB8C00; }
        .stat-bar-strength { color: #F7D51D; }
        .stat-bar-happiness { color: #92CC41; }
        
        /* Navigation */
        .game-nav {
          background: #2A2A2A;
          display: flex;
          justify-content: space-around;
          padding: 12px;
          border-top: 4px solid #3A3A3A;
        }
        
        .nav-btn {
          background: none;
          border: none;
          color: #636363;
          cursor: pointer;
          padding: 8px;
          font-size: 8px;
          font-family: 'Press Start 2P', monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .nav-btn.active {
          color: #F7D51D;
        }
        
        .nav-btn svg {
          width: 24px;
          height: 24px;
        }
        
        /* Color Palette Display */
        .color-palette {
          padding: 20px;
          background: #1A1A1A;
        }
        
        .color-group {
          margin-bottom: 20px;
        }
        
        .color-title {
          font-size: 10px;
          margin-bottom: 12px;
          color: #F7D51D;
        }
        
        .color-swatches {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        
        .color-swatch {
          aspect-ratio: 1;
          border: 2px solid #000;
          position: relative;
        }
        
        .color-name {
          position: absolute;
          bottom: 2px;
          left: 2px;
          right: 2px;
          font-size: 6px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px;
          text-align: center;
        }
        
        /* Game Boy Button */
        .gameboy-controls {
          padding: 20px;
          background: #1A1A1A;
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        
        .btn-gameboy {
          background: #565656;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          border: 3px solid #000;
          box-shadow: inset 0 -2px 4px rgba(0,0,0,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: bold;
        }
        
        .btn-gameboy:active {
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
        }
      `}</style>

      <div className="screen-container">
        {/* Header */}
        <header className="game-header">
          <h1 className="logo">16BIT FIT</h1>
        </header>

        {/* Dynamic Content Based on Tab */}
        {activeTab === 'home' && (
          <>
            {/* Character Arena */}
            <div className="character-arena">
              <div className="scanline-overlay"></div>
              <div className="character-placeholder">💪</div>
            </div>

            {/* Action Buttons */}
            <div className="action-panel">
              <button 
                className={`btn-primary ${selectedButton === 'workout' ? 'active' : ''}`}
                onClick={() => handleButtonClick('workout')}
              >
                WORKOUT
              </button>
              <button 
                className={`btn-primary btn-food ${selectedButton === 'healthy' ? 'active' : ''}`}
                onClick={() => handleButtonClick('healthy')}
              >
                EAT HEALTHY
              </button>
              <button 
                className={`btn-primary btn-error ${selectedButton === 'skip' ? 'active' : ''}`}
                onClick={() => handleButtonClick('skip')}
              >
                SKIP DAY
              </button>
              <button 
                className="btn-primary"
                disabled
              >
                LOCKED
              </button>
            </div>

            {/* Game Boy Style Controls */}
            <div className="gameboy-controls">
              <button className="btn-gameboy">A</button>
              <button className="btn-gameboy">B</button>
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-header">
                <span>❤️ HEALTH</span>
                <span>75</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill stat-bar-health" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-header">
                <span>⚡ STAMINA</span>
                <span>60</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill stat-bar-stamina" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-header">
                <span>💪 STRENGTH</span>
                <span>45</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill stat-bar-strength" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-header">
                <span>😊 HAPPINESS</span>
                <span>80</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill stat-bar-happiness" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="color-palette">
            <div className="color-group">
              <h3 className="color-title">PRIMARY COLORS</h3>
              <div className="color-swatches">
                <div className="color-swatch" style={{ background: '#2C76C8' }}>
                  <span className="color-name">BLUE</span>
                </div>
                <div className="color-swatch" style={{ background: '#F7D51D' }}>
                  <span className="color-name">YELLOW</span>
                </div>
                <div className="color-swatch" style={{ background: '#92CC41' }}>
                  <span className="color-name">GREEN</span>
                </div>
                <div className="color-swatch" style={{ background: '#E53935' }}>
                  <span className="color-name">RED</span>
                </div>
              </div>
            </div>

            <div className="color-group">
              <h3 className="color-title">BACKGROUNDS</h3>
              <div className="color-swatches">
                <div className="color-swatch" style={{ background: '#5C94FC' }}>
                  <span className="color-name">SKY</span>
                </div>
                <div className="color-swatch" style={{ background: '#8B5A3C' }}>
                  <span className="color-name">DOJO</span>
                </div>
                <div className="color-swatch" style={{ background: '#FF6B35' }}>
                  <span className="color-name">GYM</span>
                </div>
                <div className="color-swatch" style={{ background: '#2E1A47' }}>
                  <span className="color-name">NIGHT</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="game-nav">
          <button 
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home />
            HOME
          </button>
          <button 
            className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart />
            STATS
          </button>
          <button 
            className={`nav-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            <Gamepad2 />
            COLORS
          </button>
        </nav>
      </div>
    </div>
  );
};

export default StyleGuideDemo;