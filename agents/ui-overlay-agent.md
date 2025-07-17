# UI Overlay Agent

## Purpose
Specializes in user interface management, GameBoy-style interface design, overlay systems, and visual component architecture for the 16BitFit gaming application.

## Core Capabilities

### 1. UI Layout Management
- **GameBoy Interface**: Authentic retro GameBoy-style UI components
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Component Architecture**: Modular, reusable UI components
- **State Management**: Centralized UI state handling
- **Animation Systems**: Smooth transitions and micro-interactions

### 2. GameBoy Style Interface
- **Authentic Design**: Classic GameBoy aesthetics and feel
- **Pixel-Perfect**: Crisp pixel art and typography
- **Color Palette**: Monochromatic green palette with modern touches
- **Scanline Effects**: Retro CRT display simulation
- **Button Styling**: Classic GameBoy button appearance

### 3. Overlay Systems
- **HUD Management**: Health bars, stats, and game information
- **Modal Dialogs**: Pop-up windows and confirmation dialogs
- **Notification System**: Toast messages and alerts
- **Loading Screens**: Progress indicators and loading animations
- **Menu Systems**: Navigation and settings interfaces

### 4. Component Architecture
- **React Components**: Modern React component patterns
- **Styled Components**: CSS-in-JS styling approach
- **Event Handling**: User interaction management
- **Data Binding**: Dynamic content updates
- **Accessibility**: ARIA compliance and keyboard navigation

## Technical Implementation

### Core UI Components
```javascript
// GameBoy Screen Component
const GameBoyScreen = ({ children, className = '' }) => {
  return (
    <div className={`gameboy-screen ${className}`}>
      <div className="screen-bezel">
        <div className="screen-content">
          {children}
        </div>
        <div className="scanlines"></div>
      </div>
    </div>
  );
};

// Retro Button Component
const RetroButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button 
      className={`retro-button ${variant} ${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="button-text">{children}</span>
      <div className="button-shadow"></div>
    </button>
  );
};

// Health Bar Component
const HealthBar = ({ 
  current, 
  max, 
  label = 'HP',
  showNumbers = true,
  animated = true 
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="health-bar-container">
      <div className="health-bar-label">{label}</div>
      <div className="health-bar-frame">
        <div 
          className={`health-bar-fill ${animated ? 'animated' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="health-bar-shine"></div>
        </div>
        {showNumbers && (
          <div className="health-bar-text">
            {current}/{max}
          </div>
        )}
      </div>
    </div>
  );
};
```

### CSS Styling System
```css
/* GameBoy Color Palette */
:root {
  --gameboy-green: #92CC41;
  --gameboy-dark: #0D0D0D;
  --gameboy-medium: #556B2F;
  --gameboy-light: #9BBC0F;
  --gameboy-screen: #8BAC0F;
  --gameboy-shadow: #0F0F0F;
  --gameboy-highlight: #C4DC62;
}

/* GameBoy Screen Styling */
.gameboy-screen {
  background: var(--gameboy-screen);
  border: 6px solid var(--gameboy-dark);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 0 0 2px var(--gameboy-highlight),
    0 4px 8px rgba(0,0,0,0.3);
}

.screen-bezel {
  background: linear-gradient(
    135deg,
    var(--gameboy-screen) 0%,
    var(--gameboy-light) 50%,
    var(--gameboy-screen) 100%
  );
  padding: 8px;
  position: relative;
}

.screen-content {
  background: var(--gameboy-screen);
  border: 2px solid var(--gameboy-dark);
  border-radius: 4px;
  position: relative;
  z-index: 2;
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
  z-index: 3;
}

/* Retro Button Styling */
.retro-button {
  background: var(--gameboy-green);
  border: 3px solid var(--gameboy-dark);
  border-radius: 8px;
  color: var(--gameboy-dark);
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  font-weight: bold;
  letter-spacing: 0.5px;
  padding: 8px 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.1s ease;
  text-transform: uppercase;
  box-shadow: 
    0 4px 0 var(--gameboy-shadow),
    0 4px 8px rgba(0,0,0,0.2);
}

.retro-button:hover {
  background: var(--gameboy-highlight);
  transform: translateY(1px);
  box-shadow: 
    0 3px 0 var(--gameboy-shadow),
    0 3px 6px rgba(0,0,0,0.2);
}

.retro-button:active {
  transform: translateY(4px);
  box-shadow: 
    0 0 0 var(--gameboy-shadow),
    0 0 2px rgba(0,0,0,0.2);
}

.retro-button:disabled {
  background: var(--gameboy-medium);
  cursor: not-allowed;
  transform: none;
  box-shadow: 
    0 2px 0 var(--gameboy-shadow),
    0 2px 4px rgba(0,0,0,0.1);
}

/* Health Bar Styling */
.health-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.health-bar-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--gameboy-dark);
  min-width: 24px;
}

.health-bar-frame {
  flex: 1;
  height: 12px;
  background: var(--gameboy-dark);
  border: 2px solid var(--gameboy-shadow);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.health-bar-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--gameboy-green) 0%,
    var(--gameboy-highlight) 100%
  );
  position: relative;
  transition: width 0.3s ease;
}

.health-bar-fill.animated {
  animation: pulse 2s infinite;
}

.health-bar-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.3) 0%,
    transparent 100%
  );
}

.health-bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: var(--gameboy-dark);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

### State Management System
```javascript
// UI State Context
const UIStateContext = createContext();

const UIStateProvider = ({ children }) => {
  const [uiState, setUIState] = useState({
    activeScreen: 'home',
    showHUD: true,
    notifications: [],
    modals: [],
    loading: false,
    theme: 'gameboy'
  });

  const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      duration
    };
    
    setUIState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));
    
    setTimeout(() => {
      removeNotification(notification.id);
    }, duration);
  };

  const removeNotification = (id) => {
    setUIState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const showModal = (component, props = {}) => {
    const modal = {
      id: Date.now(),
      component,
      props
    };
    
    setUIState(prev => ({
      ...prev,
      modals: [...prev.modals, modal]
    }));
    
    return modal.id;
  };

  const closeModal = (id) => {
    setUIState(prev => ({
      ...prev,
      modals: prev.modals.filter(m => m.id !== id)
    }));
  };

  const value = {
    uiState,
    setUIState,
    showNotification,
    removeNotification,
    showModal,
    closeModal
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within UIStateProvider');
  }
  return context;
};
```

## UI Component Library

### 1. Navigation Components
```javascript
// GameBoy Menu Component
const GameBoyMenu = ({ items, onSelect, activeIndex = 0 }) => {
  const [selectedIndex, setSelectedIndex] = useState(activeIndex);

  const handleKeyPress = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        setSelectedIndex(prev => Math.min(items.length - 1, prev + 1));
        break;
      case 'Enter':
        onSelect(items[selectedIndex]);
        break;
    }
  };

  return (
    <div className="gameboy-menu" onKeyDown={handleKeyPress} tabIndex={0}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className="menu-cursor">►</span>
          <span className="menu-text">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Tab Navigation Component
const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-navigation">
      {tabs.map((tab, index) => (
        <RetroButton
          key={tab.id}
          variant={activeTab === tab.id ? 'primary' : 'secondary'}
          onClick={() => onTabChange(tab.id)}
          className="tab-button"
        >
          {tab.label}
        </RetroButton>
      ))}
    </div>
  );
};
```

### 2. Data Display Components
```javascript
// Stat Display Component
const StatDisplay = ({ 
  icon, 
  label, 
  value, 
  maxValue, 
  color = 'green',
  showBar = true 
}) => {
  return (
    <div className="stat-display">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {showBar && maxValue && (
          <div className="stat-bar">
            <div 
              className={`stat-bar-fill ${color}`}
              style={{ width: `${(value / maxValue) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ 
  progress, 
  size = 60, 
  strokeWidth = 6,
  color = 'var(--gameboy-green)'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--gameboy-dark)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring-fill"
      />
    </svg>
  );
};
```

### 3. Interactive Components
```javascript
// GameBoy Input Component
const GameBoyInput = ({ 
  value, 
  onChange, 
  placeholder,
  type = 'text',
  maxLength
}) => {
  return (
    <div className="gameboy-input-container">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="gameboy-input"
      />
      <div className="input-border"></div>
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ 
  checked, 
  onChange, 
  label,
  disabled = false 
}) => {
  return (
    <label className={`toggle-switch ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="toggle-input"
      />
      <span className="toggle-slider"></span>
      <span className="toggle-label">{label}</span>
    </label>
  );
};
```

## Overlay Systems

### 1. HUD Management
```javascript
// Game HUD Component
const GameHUD = ({ playerStats, gameState }) => {
  const { showHUD } = useUIState();

  if (!showHUD) return null;

  return (
    <div className="game-hud">
      <div className="hud-top">
        <StatDisplay 
          icon="❤️" 
          label="Health" 
          value={playerStats.health}
          maxValue={playerStats.maxHealth}
          color="red"
        />
        <StatDisplay 
          icon="⚡" 
          label="Stamina" 
          value={playerStats.stamina}
          maxValue={playerStats.maxStamina}
          color="yellow"
        />
      </div>
      
      <div className="hud-center">
        <div className="level-indicator">
          LEVEL {playerStats.level}
        </div>
        <ProgressRing 
          progress={(playerStats.xp / playerStats.nextLevelXp) * 100}
          size={80}
        />
      </div>
      
      <div className="hud-bottom">
        <div className="mini-map">
          {/* Mini-map component */}
        </div>
        <div className="action-buttons">
          <RetroButton onClick={() => {}}>ATTACK</RetroButton>
          <RetroButton onClick={() => {}}>DEFEND</RetroButton>
        </div>
      </div>
    </div>
  );
};
```

### 2. Modal System
```javascript
// Modal Manager Component
const ModalManager = () => {
  const { uiState, closeModal } = useUIState();

  return (
    <div className="modal-manager">
      {uiState.modals.map(modal => (
        <div key={modal.id} className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => closeModal(modal.id)}
            >
              ×
            </button>
            <modal.component {...modal.props} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Yes',
  cancelText = 'No'
}) => {
  return (
    <div className="confirm-dialog">
      <div className="dialog-message">{message}</div>
      <div className="dialog-buttons">
        <RetroButton onClick={onConfirm} variant="primary">
          {confirmText}
        </RetroButton>
        <RetroButton onClick={onCancel} variant="secondary">
          {cancelText}
        </RetroButton>
      </div>
    </div>
  );
};
```

## Animation and Effects

### 1. Transition System
```javascript
// Transition Hook
const useTransition = (show, duration = 300) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), duration);
    }
  }, [show, duration]);

  return { shouldRender, isVisible };
};

// Animated Component
const AnimatedComponent = ({ 
  show, 
  children, 
  animation = 'fade',
  duration = 300 
}) => {
  const { shouldRender, isVisible } = useTransition(show, duration);

  if (!shouldRender) return null;

  return (
    <div 
      className={`animated-component ${animation} ${isVisible ? 'visible' : 'hidden'}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};
```

### 2. Loading States
```javascript
// Loading Spinner Component
const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-pixel"></div>
        <div className="spinner-pixel"></div>
        <div className="spinner-pixel"></div>
        <div className="spinner-pixel"></div>
      </div>
      <div className="loading-message">{message}</div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress, label, showPercent = true }) => {
  return (
    <div className="progress-bar-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercent && (
        <div className="progress-percent">{Math.round(progress)}%</div>
      )}
    </div>
  );
};
```

## Integration with 16BitFit

### 1. Workout UI Integration
- **Real-time Stats**: Display workout metrics during exercise
- **Progress Tracking**: Visual progress indicators for fitness goals
- **Achievement Notifications**: Celebrate workout milestones
- **Gamification Elements**: XP gains, level ups, and rewards

### 2. Character UI Integration
- **Character Stats**: Display health, strength, stamina, focus
- **Evolution Progress**: Show character development over time
- **Equipment UI**: Manage character gear and abilities
- **Battle Interface**: Combat-specific UI elements

### 3. Social Features
- **Leaderboards**: Compare progress with friends
- **Challenges**: UI for workout challenges and competitions
- **Sharing**: Social media integration for achievements
- **Community**: Forums and group workout features

## Best Practices

1. **Accessibility**: Ensure keyboard navigation and screen reader support
2. **Performance**: Optimize rendering with React.memo and useMemo
3. **Responsiveness**: Design for multiple screen sizes and orientations
4. **Consistency**: Maintain consistent design patterns throughout
5. **User Experience**: Prioritize intuitive and engaging interactions
6. **Testing**: Implement comprehensive UI testing strategies

## Future Enhancements

1. **Advanced Animations**: Complex transition systems and micro-interactions
2. **Custom Themes**: User-customizable color schemes and styles
3. **Gesture Support**: Touch gestures for mobile interaction
4. **Voice Controls**: Voice-activated navigation and commands
5. **AR Integration**: Augmented reality overlay features
6. **Advanced Analytics**: User behavior tracking and optimization

This agent serves as the primary resource for all UI management, GameBoy-style interface design, and overlay system implementation in the 16BitFit application. 