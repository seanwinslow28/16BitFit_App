# 16BitFit Development Memory - Phaser 3 Architecture

## Project Vision
Transform real-world fitness activities into authentic Street Fighter 2 victories through a Phaser 3 WebView fighting game that achieves 60fps performance and 80% day-1 retention by combining immediate gratification mechanics with progressive 5-stage character evolution.

## Current Sprint Plan (Next 2 Weeks)

### Week 1: Phaser 3 Foundation & Core Systems
**Lead: Phaser3 Integration Specialist + Game Dev Specialist**

#### Day 1-3: WebView Bridge & Asset Pipeline
- [ ] Set up React Native WebView with binary message protocol
- [ ] Implement PhaserWebViewBridge for <50ms input latency
- [ ] Create asset loading system with texture atlasing
- [ ] Test basic Phaser 3 rendering at 60fps

#### Day 4-7: Street Fighter 2 Combat Core
- [ ] Implement hitbox/hurtbox collision system
- [ ] Create basic moves (LP, MP, HP, LK, MK, HK)
- [ ] Add special move input detection (QCF, DP motions)
- [ ] Integrate first boss with AI patterns

#### Day 8-10: Evolution System Integration
- [ ] Connect 5-stage evolution sprites to Phaser
- [ ] Implement evolution ceremony animations
- [ ] Create stat modifier system for combat
- [ ] Test character transformation flow

#### Day 11-14: Database & Real-time Sync
- [ ] Deploy PostgreSQL schema via Supabase
- [ ] Implement real-time stat synchronization
- [ ] Create battle result reporting system
- [ ] Test offline/online data sync

### Week 2: Polish & Performance
**Lead: Performance Optimizer + Testing Specialist**

#### Day 15-18: Performance Optimization
- [ ] Profile and optimize render pipeline
- [ ] Implement dynamic quality adjustment
- [ ] Add object pooling for projectiles
- [ ] Ensure 60fps on iPhone 12/Android 10+

#### Day 19-21: Remaining Bosses & Balance
- [ ] Implement bosses 2-6 with unique patterns
- [ ] Balance damage calculations
- [ ] Add combo system with damage scaling
- [ ] Test all character archetypes

#### Day 22-24: Mobile UI & Controls
- [ ] Optimize touch controls for fighting game
- [ ] Create responsive battle UI overlay
- [ ] Add haptic feedback for impacts
- [ ] Polish onboarding flow

#### Day 25-28: Integration Testing
- [ ] Full user journey testing
- [ ] WebView memory leak validation
- [ ] Performance testing on target devices
- [ ] Fix critical bugs

## Architecture Decisions

### Technical Stack
- **Frontend**: React Native shell + Phaser 3 WebView
- **Game Engine**: Phaser 3.70+ with Matter.js physics
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Communication**: Binary MessageChannel protocol
- **State Management**: Zustand (RN) + Phaser DataManager
- **Analytics**: PostHog with custom game events

### Phaser 3 + WebView Architecture
```
React Native App
├── Navigation & UI Shell
├── Character Management
├── Fitness Tracking
└── WebView Container
    └── Phaser 3 Game
        ├── Asset Manager
        ├── Combat Engine
        ├── Evolution Renderer
        └── Performance Monitor
```

### Key Design Choices
1. **WebView Isolation**: Fighting game runs in dedicated WebView for performance
2. **Binary Protocol**: Minimal overhead for input/state communication
3. **Progressive Loading**: Assets load by priority to reduce initial load
4. **Fixed Timestep**: Consistent 60fps physics regardless of render rate
5. **Quality Tiers**: Ultra → High → Medium → Low → Potato modes

## Sub-Agent Coordination

### Critical Path Teams

#### Phaser Integration Team
- **Lead**: Phaser3 Integration Specialist
- **Support**: Game Dev, Performance Optimizer
- **Goal**: 60fps WebView fighting game

#### Combat System Team
- **Lead**: Game Dev Specialist
- **Support**: Avatar Evolution, Testing
- **Goal**: Authentic Street Fighter 2 mechanics

#### Evolution System Team
- **Lead**: Avatar Evolution Specialist
- **Support**: UI/UX, Backend
- **Goal**: 5-stage visual progression system

#### Health Integration Team
- **Lead**: Health Integration Specialist
- **Support**: Backend, API Integration
- **Goal**: Real-time fitness → combat stats

### Handoff Protocol
1. **Daily Sync**: 9 AM standup via GitHub issues
2. **WebView Bridge**: Phaser3 → Game Dev handoff
3. **Asset Pipeline**: Avatar → Phaser3 handoff
4. **Stat Calculations**: Health → Backend → Game Dev
5. **Weekly Demo**: Friday progress showcase

## MCP Tool Integration

### Development Workflow
```bash
# GitHub MCP - Asset Management
- Phaser game repository
- Sprite sheet version control
- WebView bridge code reviews

# Supabase MCP - Real-time Features
- Character progression tables
- Battle result storage
- Leaderboard queries
- Real-time stat updates

# Mobile MCP - Device Testing
- WebView performance profiling
- Touch input latency testing
- Memory usage monitoring

# Firecrawl - Market Research
- Fighting game community analysis
- Fitness app feature comparison
- WebView performance benchmarks
```

## Success Metrics

### Technical Performance
- **Frame Rate**: 60fps during combat (90% consistency)
- **Input Latency**: <50ms touch to character response
- **Memory Usage**: <150MB peak during battles
- **Load Time**: <3s to playable state
- **Crash Rate**: <0.1% of sessions

### User Engagement
- **Onboarding**: 80% completion in <60 seconds
- **Day-1 Retention**: 80% return rate
- **Evolution Progress**: 50% reach stage 2 in week 1
- **Battle Completion**: 90% complete first boss
- **Daily Active**: 60% DAU/MAU ratio

### Business Metrics
- **Downloads**: 8,000 in month 1
- **Reviews**: 4.5+ star average
- **Viral Coefficient**: 0.3 (referral rate)
- **Revenue**: $30 daily from cosmetics
- **Community**: 500 Discord members

## Risk Mitigation

### Critical Risks & Mitigations

#### 1. WebView Performance (HIGH)
- **Risk**: Can't achieve 60fps in WebView
- **Mitigation**: Progressive quality system, GPU optimization
- **Contingency**: Reduce particle effects, simplify backgrounds
- **Owner**: Performance Optimizer

#### 2. Asset Loading Time (HIGH)
- **Risk**: Large sprite sheets cause slow loads
- **Mitigation**: Progressive loading, IndexedDB caching
- **Contingency**: Reduce initial character roster
- **Owner**: Phaser3 Integration Specialist

#### 3. Input Latency (MEDIUM)
- **Risk**: Touch controls feel sluggish
- **Mitigation**: Binary protocol, input prediction
- **Contingency**: Simplify special move inputs
- **Owner**: Game Dev Specialist

#### 4. Memory Leaks (MEDIUM)
- **Risk**: WebView memory grows over time
- **Mitigation**: Object pooling, careful cleanup
- **Contingency**: Battle session limits
- **Owner**: Performance Optimizer

## Immediate Action Items

### Today (Priority Order)
1. **Phaser3 Specialist**: Create WebView bridge prototype
2. **Game Dev**: Set up Phaser 3 project structure
3. **Backend**: Deploy Supabase schema
4. **Avatar Evolution**: Export sprite sheets
5. **Performance**: Set up profiling tools

### This Week
- WebView communication working
- Basic fighter rendering in Phaser
- First boss AI implemented
- Touch controls responding <50ms
- 60fps on test devices

### Next Week
- All 6 bosses playable
- Evolution system integrated
- Performance optimized
- Beta build ready
- Testing protocol active

## Technical Debt & Future Considerations

### Known Technical Debt
1. WebView bridge needs optimization
2. Asset pipeline requires automation
3. No multiplayer infrastructure yet
4. Limited to 6 bosses initially

### Post-MVP Features (V2)
1. PvP battles via WebRTC
2. Daily challenges system
3. Guild raids (co-op bosses)
4. Advanced combos/cancels
5. Tournament mode

### Long-term (V3)
1. Native game engine consideration
2. Cross-platform (web) version
3. Spectator mode
4. Replay system
5. Custom character creator

## Development Commands

```bash
# Install dependencies
npm install

# Run React Native
npm run start

# Run Phaser development
npm run phaser:dev

# Build Phaser for production
npm run phaser:build

# Run iOS
npm run ios

# Run Android  
npm run android

# Run tests
npm test

# Profile performance
npm run profile

# Bundle assets
npm run assets:bundle
```

## Key File Locations

- **WebView Bridge**: `app/services/PhaserWebViewBridge.js`
- **Phaser Game**: `phaser-game/src/main.js`
- **Combat System**: `phaser-game/src/systems/CombatSystem.js`
- **Evolution Sprites**: `phaser-game/assets/sprites/evolution/`
- **Database Schema**: `supabase/migrations/`
- **Performance Config**: `phaser-game/src/config/performance.js`

## Specialist Contact Points

Each specialist owns their domain:
- **Phaser3 Integration**: @phaser3-integration-specialist
- **Game Dev**: @game-dev-specialist
- **Avatar Evolution**: @avatar-evolution-specialist
- **Performance**: @performance-optimizer
- **Backend**: @backend-specialist
- **Health Integration**: @health-integration-specialist
- **UI/UX**: @ui-ux-specialist
- **Testing**: @testing-specialist

---

Last Updated: 2025-01-28
Next Review: Daily at 9 AM standup