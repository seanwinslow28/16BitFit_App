# 16BitFit Product Requirements Document

## Real Workouts. Retro Power-Ups. Epic Battles.

16BitFit transforms daily fitness activities into fighting game victories through a revolutionary gamification system that makes every workout count. Users log real workouts and nutrition to power up their retro fighting game character, then battle AI opponents and friends in Street Fighter-style combat. With 80% day-1 retention targets and a 37-day MVP launch timeline, this PRD consolidates seven strategic documents into a comprehensive development guide for Claude Code and Cursor implementation.

## 1. Executive Summary

### Business Objectives
16BitFit addresses the $1.38 billion fitness gaming market (projected to reach $8.21 billion by 2035) by solving the core motivation problem in fitness apps: lack of immediate, tangible rewards for physical effort. Our unique approach combines authentic fighting game mechanics with genuine fitness tracking, targeting 20-45 year old retro gaming fitness enthusiasts who represent the highest-value segment in both markets.

**Key Business Goals:**
- Achieve 80% day-1 retention (vs. industry average 25%)
- Reach 10,000 MAU within 6 months
- Generate $720 daily revenue by month 6 through ad monetization
- Establish market leadership in fitness-fighting game crossover category

### Product Vision
16BitFit creates an addictive feedback loop where real-world fitness activities translate to immediate character power-ups and fighting game victories. Unlike competitors who offer abstract gamification (Habitica's text-based rewards) or narrative-only engagement (Zombies, Run!), we provide visceral, skill-based combat that directly reflects users' fitness achievements.

### Success Metrics
- **Retention**: 80% day-1, 50% day-7, 25% day-30
- **Engagement**: 3+ activities logged per week average
- **Technical**: 60fps fighting gameplay, <3 second load times
- **Growth**: 25% organic user acquisition through social sharing

## 2. User Personas and Market Analysis

### Primary Persona: The Retro Gaming Fitness Enthusiast (70% of target users)
**Demographics**: 25-35 years old, 60% male/40% female, $40-80K income
**Behaviors**: 
- Grew up with Street Fighter, Mortal Kombat, and classic fighting games
- Currently uses fitness apps but lacks consistent motivation
- Values nostalgia and authentic gaming experiences
- Shares achievements on social media

**Pain Points**:
- Traditional fitness apps feel like work, not play
- Generic gamification (points, badges) lacks meaningful progression
- No immediate, tangible reward for completing workouts

### Secondary Persona: The Casual Fitness Gamer (20% of target users)
**Demographics**: 20-45 years old, 70% female/30% male, diverse income levels
**Behaviors**:
- Enjoys mobile games but isn't a "hardcore" gamer
- Seeks fun, accessible fitness solutions
- Values social features and community support

### Tertiary Persona: The Competitive Gamer Seeking Fitness (10% of target users)
**Demographics**: 18-30 years old, 80% male/20% female, tech-savvy
**Behaviors**:
- Highly skilled at fighting games
- Interested in optimizing physical performance
- Will min-max character stats through targeted workouts

### Market Opportunity
The fitness app market reached $10.59 billion in 2024, with the gaming subset growing at 17.6% CAGR. Key differentiators:
- **vs. Habitica**: Visual character progression + real fighting mechanics
- **vs. Zombies, Run!**: Skill-based gameplay + competitive elements
- **vs. Pokemon GO**: Indoor-friendly + genuine fitness focus
- **vs. Ring Fit Adventure**: Mobile accessibility + no hardware required

## 3. Detailed User Stories with Acceptance Criteria

### Epic 1: Onboarding & First Experience (Must Have)

**US001: 60-Second Value Demonstration**
**As a** first-time user
**I want** to understand the app's core value within 60 seconds
**So that** I can decide whether to continue using the app

**Acceptance Criteria:**
- Given I open the app for the first time
- When the onboarding sequence begins
- Then I see character power-up animation from workout (30 seconds)
- And I can start logging my first activity within 60 seconds
- And I understand the concept with <50 words of text

**Technical AC:**
- Onboarding loads in <3 seconds on 4G
- Skip available after 10 seconds
- No account required for first 60 seconds
- Tracks time-to-first-value metric

### Epic 2: Core Gameplay Loop (Must Have)

**US007: Quick Activity Logging**
**As a** fitness enthusiast
**I want** to quickly log workouts
**So that** my character gains stats immediately

**Acceptance Criteria:**
- Given I tap "Log Workout"
- When I search from 500+ exercises
- Then I can log sets/reps/duration in <30 seconds
- And character stats update with animation
- And I see exact stat gains (+5 Strength, +3 Endurance)

**US013: Street Fighter-Style Combat**
**As a** retro gaming fan
**I want** authentic quarter-circle special moves
**So that** combat feels like classic fighting games

**Acceptance Criteria:**
- Given I'm in battle
- When I perform quarter-circle + punch
- Then special move executes with 95% accuracy
- And damage scales with my fitness stats
- And 60fps performance maintained

### Epic 3: Character Progression (Must Have)

**US010: Real-time Stat Evolution**
**As a** user who logs activities
**I want** immediate visual feedback
**So that** I feel rewarded for exercise

**Acceptance Criteria:**
- Given I complete activity log
- When stats calculate
- Then character animation shows growth
- And stat bars fill proportionally
- And changes reflect in <2 seconds

[Full user story list includes 35+ stories organized by epic - see appendix]

## 4. Complete Feature Specifications (MoSCoW Prioritized)

### Phase 1: MVP Core Loop (Weeks 1-8)

#### MUST HAVE Features

| Feature | Priority | Dev Time | Success Metric | Technical Requirements |
|---------|----------|----------|----------------|----------------------|
| **Guest Mode Login** | P0 | 1 week | >95% complete onboarding | AsyncStorage, no backend calls |
| **3 Character Archetypes** | P0 | 1 week | >90% select in <10 sec | Sprite sheets loaded, 60fps preview |
| **Activity Logging** | P0 | 2 weeks | >85% log first activity | 500+ exercise database, offline sync |
| **Nutrition Tracking** | P0 | 1 week | >75% add food choices | Barcode scanner, food database |
| **Character Evolution** | P0 | 2 weeks | >98% see stat changes | Real-time calculation engine |
| **One-Touch Combat** | P0 | 2 weeks | >90% complete first battle | React Native Game Engine setup |

#### SHOULD HAVE Features

| Feature | Priority | Dev Time | Defer Until |
|---------|----------|----------|-------------|
| **Achievement System** | P1 | 1 week | Week 3 - after core loop proven |
| **Progress Visualization** | P1 | 1 week | Week 4 - once habit forming |
| **Character Customization** | P1 | 2 weeks | Week 6 - engagement booster |
| **Audio Feedback** | P1 | 1 week | Week 5 - polish feature |

#### COULD HAVE Features
- Voice logging (P2) - Complex implementation
- Multiple battle arenas (P2) - Visual variety not critical
- Detailed nutrition analysis (P2) - Overwhelming for beginners

#### WON'T HAVE (MVP)
- Social features - Too complex for MVP
- Third-party integrations - Dependency risk
- Multiplayer combat - Requires servers
- Premium features - No monetization until retention proven

### Feature Dependency Map
```
Guest Mode → Character Creation → Activity Logging → Stat Calculation
                                      ↓
                           Nutrition Tracking → Character Evolution → Combat System
```

## 5. Technical Requirements and Architecture

### System Architecture
```yaml
Frontend:
  - Framework: React Native 0.73+
  - Game Engine: React Native Game Engine
  - State Management: Zustand with persistence
  - Navigation: React Navigation 6
  - UI Components: Custom pixel art components

Backend:
  - Platform: Supabase (PostgreSQL, Auth, Realtime)
  - Authentication: JWT with Row Level Security
  - Storage: Supabase Storage for sprites/assets
  - Real-time: WebSocket subscriptions

Performance Requirements:
  - Fighting game: 60fps consistent
  - App launch: <3 seconds
  - UI response: <100ms
  - Memory usage: <150MB
  - Battery drain: <10% per 30 minutes
```

### Database Schema
```sql
-- Core tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE characters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  archetype TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  strength INTEGER DEFAULT 10,
  endurance INTEGER DEFAULT 10,
  speed INTEGER DEFAULT 10,
  health INTEGER DEFAULT 100,
  power INTEGER DEFAULT 10
);

CREATE TABLE activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  stat_gains JSONB,
  logged_at TIMESTAMP DEFAULT NOW()
);
```

### Character Stat Calculation Engine
```typescript
interface StatCalculation {
  calculateStrength(activity: Activity): number {
    const baseGain = activity.type === 'strength' ? 5 : 2;
    return baseGain * (activity.duration / 30) * intensityMultiplier;
  }
  
  calculateEndurance(activity: Activity): number {
    const baseGain = activity.type === 'cardio' ? 5 : 2;
    return baseGain * (activity.duration / 20) * consistencyBonus;
  }
}
```

### Security Architecture
- **Data Encryption**: AES-256 for health data at rest
- **Network Security**: TLS 1.3 for all API calls
- **Authentication**: OAuth 2.0 for social logins
- **Privacy Compliance**: GDPR/CCPA compliant data handling
- **Health Data**: HIPAA considerations for fitness tracking

## 6. API Specifications for Key Integrations

### Core API Endpoints
```yaml
# Authentication
POST /auth/register
  Body: { email, password, username }
  Response: { access_token, user_id }

POST /auth/login
  Body: { email, password }
  Response: { access_token, refresh_token }

# Character Management  
GET /characters
  Response: { characters: [...] }

POST /characters
  Body: { name, archetype }
  Response: { character_id, initial_stats }

# Activity Logging
POST /activities
  Body: { type, name, duration, intensity }
  Response: { activity_id, stat_gains }

# Battle System
POST /battles/start
  Body: { opponent_type, difficulty }
  Response: { battle_id, opponent_stats }

POST /battles/{id}/move
  Body: { move_type, input_sequence }
  Response: { damage_dealt, opponent_response }
```

### Health Platform Integration

#### Apple Health (iOS)
```typescript
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.HeartRate
    ]
  }
};
```

#### Google Fit (Android)
```typescript
const fitnessOptions = FitnessOptions.builder()
  .addDataType(DataType.TYPE_STEP_COUNT_DELTA)
  .addDataType(DataType.TYPE_CALORIES_EXPENDED)
  .build();
```

### Integration Roadmap
**Phase 1 (MVP)**: Manual logging only
**Phase 2**: Apple Health + Google Fit ($0 cost)
**Phase 3**: MyFitnessPal, Fitbit ($100/month)
**Phase 4**: AI nutrition recognition, Whoop

## 7. Performance Requirements and Success Metrics

### Technical Performance KPIs
| Metric | Target | Current Industry Average |
|--------|--------|-------------------------|
| App Launch Time | <3 seconds | 4-6 seconds |
| Fighting Game FPS | 60fps stable | 30-45fps |
| Memory Usage | <150MB | 200-300MB |
| Crash Rate | <0.1% | 1-2% |
| API Response Time | <200ms | 500ms-1s |

### User Engagement Metrics
| Metric | MVP Target | Industry Average | Measurement Method |
|--------|------------|------------------|-------------------|
| Day-1 Retention | 80% | 25% | Firebase Analytics |
| Day-7 Retention | 50% | 12% | Cohort Analysis |
| Day-30 Retention | 25% | 7% | Monthly Active Users |
| Session Length | >8 minutes | 3-5 minutes | Time in App |
| Activities/Week | 3+ | 1.5 | Database Query |

### Business Success Metrics
- **User Acquisition Cost**: $0 (organic only for MVP)
- **Revenue Target**: $720/day by month 6 (ad monetization)
- **Social Sharing Rate**: 25% of active users
- **App Store Rating**: 4.5+ stars
- **Net Promoter Score**: >40

## 8. Development Timeline and Milestones

### 37-Day MVP Sprint Plan

#### Week 1-2: Foundation (Days 1-14)
- [ ] Guest mode implementation
- [ ] Character archetype selection
- [ ] Basic activity logging UI
- [ ] Supabase backend setup
- **Demo Goal**: Log activity → see character

#### Week 3-4: Core Loop (Days 15-28)
- [ ] Stat calculation engine
- [ ] React Native Game Engine integration
- [ ] Basic combat system
- [ ] Character animation system
- **Demo Goal**: Complete workout → battle → victory

#### Week 5: Polish & Testing (Days 29-35)
- [ ] Achievement system
- [ ] Audio/haptic feedback
- [ ] Performance optimization
- [ ] Friends & family beta (20 users)
- **Demo Goal**: Polished MVP experience

#### Week 6: Launch Prep (Days 36-37)
- [ ] App store assets
- [ ] Analytics implementation
- [ ] Final bug fixes
- [ ] Launch monitoring setup
- **Demo Goal**: Production-ready app

### Post-MVP Roadmap
**Month 2**: Social features, progress visualization
**Month 3**: Health platform integrations
**Month 4**: Multiplayer battles, guilds
**Month 5**: Premium features, monetization
**Month 6**: AI coaching, advanced analytics

## 9. Risk Assessment and Mitigation Strategies

### Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|---------|-------------------|
| **60fps Performance Issues** | Medium | High | Early React Native Game Engine testing, performance profiling from day 1 |
| **Sprite Rendering Problems** | Medium | High | Fallback to simplified graphics, progressive enhancement |
| **Offline Sync Conflicts** | Low | Medium | Conflict resolution UI, server timestamp authority |
| **Memory Leaks** | Medium | High | Automated testing, Flipper profiling, careful asset management |

### Product Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|---------|-------------------|
| **User Confusion** | High | High | Progressive disclosure, extensive user testing |
| **Low Retention** | Medium | Critical | Validate core loop weekly, rapid iteration |
| **Feature Creep** | High | Medium | Strict MVP scope, stakeholder alignment |

### Market Risks
- **Competition Response**: Focus on unique fighting mechanics
- **User Acquisition Costs**: Organic growth through developer content
- **Platform Policy Changes**: Compliance monitoring, backup distribution

### Mitigation Framework
1. **Weekly Risk Reviews**: Assess probability changes
2. **User Testing Cycles**: 20+ testers weekly
3. **Performance Monitoring**: Real-time dashboards
4. **Pivot Protocols**: Clear decision criteria

## 10. Launch Criteria and Go-to-Market Approach

### MVP Launch Criteria (Must Meet All)
- [ ] 90% crash-free sessions in beta
- [ ] 60fps combat on iPhone 12+ and mid-range Android
- [ ] 80% beta tester day-1 retention
- [ ] <3 second cold start time
- [ ] Core loop completable in <5 minutes

### Go-to-Market Strategy

#### Pre-Launch (Days 1-30)
- **Developer Community Building**: Daily development vlogs
- **Technical Content**: "Building 60fps Fighting Games in React Native"
- **Beta Community**: Discord server for early testers

#### Launch Week (Days 31-37)
- **Product Hunt**: Tuesday launch for maximum visibility
- **Reddit Strategy**: r/fitness, r/gaming, r/reactnative
- **Influencer Outreach**: 10 micro-influencers in fitness gaming

#### Post-Launch Growth
- **Content Marketing**: Weekly technical blog posts
- **Community Challenges**: User-generated workout competitions  
- **Viral Mechanics**: Social sharing of character progress
- **Developer Advocacy**: Open source combat system components

### Success Validation
**Week 1**: 1,000 downloads, 80% retention
**Month 1**: 5,000 MAU, 3+ sessions/week
**Month 3**: 10,000 MAU, community-driven growth
**Month 6**: $720/day revenue, sustainable unit economics

## Appendices

### A. Complete User Story Backlog
[35+ detailed user stories with acceptance criteria - available in full document]

### B. Technical Architecture Diagrams
[System architecture, data flow, state management diagrams]

### C. Competitive Feature Matrix
[Detailed comparison with Habitica, Zombies Run!, Pokemon GO, Ring Fit]

### D. API Documentation
[Complete OpenAPI 3.0 specification for all endpoints]

### E. Design System Guidelines
[16-bit aesthetic, color palettes, component library]

---

## Document Control

**Version**: 1.0
**Last Updated**: July 25, 2025
**Status**: Ready for Development
**Owner**: Product Management
**Reviewers**: Engineering, Design, QA

This PRD serves as the single source of truth for 16BitFit development. All implementation decisions should reference this document, with updates tracked through version control.