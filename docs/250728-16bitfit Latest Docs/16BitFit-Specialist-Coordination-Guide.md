# 16BitFit Specialist Coordination & Handoff Guide

## Specialist Team Overview

### Core Development Team
1. **Backend Specialist** - Critical path owner for infrastructure
2. **Phaser3 Integration Specialist** - WebView and game engine expert
3. **Game Dev Specialist** - Combat mechanics and game design
4. **Avatar Evolution Specialist** - Character progression and visuals
5. **Performance Optimizer** - 60fps target and optimization

### Support Team
6. **UI/UX Specialist** - Interface design and user flows (Missing)
7. **Testing Specialist** - Quality assurance and validation
8. **API Integration Specialist** - Third-party service integration
9. **DevOps Deployment Specialist** - Infrastructure and CI/CD
10. **Data Analytics Specialist** - PostHog and metrics

### Business Team
11. **Product Manager** - Overall coordination and priorities
12. **Marketing Specialist** - Go-to-market and launch
13. **Privacy Security Specialist** - Data protection and compliance
14. **Community Management Specialist** - User engagement
15. **Customer Success Specialist** - User satisfaction

## Critical Path Dependencies

### Week 1 Dependencies
```
Backend Specialist
    ↓ (Supabase setup)
API Integration Specialist
    ↓ (Real-time config)
Phaser3 Integration Specialist
    ↓ (WebView bridge)
Game Dev Specialist
```

### Week 2 Dependencies
```
Avatar Evolution Specialist
    ↓ (Sprite sheets)
Phaser3 Integration Specialist
    ↓ (Asset loading)
Game Dev Specialist
    ↓ (Combat system)
Testing Specialist
```

### Week 3 Dependencies
```
Performance Optimizer
    ↓ (Optimization)
All Specialists
    ↓ (Integration)
Testing Specialist
    ↓ (Validation)
Data Analytics Specialist
```

### Week 4 Dependencies
```
Testing Specialist
    ↓ (Final QA)
Marketing Specialist
    ↓ (Launch prep)
DevOps Specialist
    ↓ (Deployment)
Product Manager
```

## Handoff Protocols

### Standard Handoff Template
```markdown
## Handoff: [From Specialist] → [To Specialist]
**Date**: [Date]
**Feature**: [Feature Name]
**Status**: Ready for [Next Phase]

### Completed Work
- [ ] Item 1
- [ ] Item 2

### Deliverables
- File 1: [Path]
- File 2: [Path]

### Next Steps
1. Step 1
2. Step 2

### Known Issues
- Issue 1
- Issue 2

### Testing Notes
- How to test
- Expected results
```

### Critical Handoffs

#### 1. Backend → Phaser3 (Day 4)
**Deliverables**:
- Working Supabase connection
- Authentication system
- Real-time subscriptions
- API documentation

**Success Criteria**:
- Can create/read user data
- WebSocket connections stable
- Auth tokens working

#### 2. Phaser3 → Game Dev (Day 7)
**Deliverables**:
- WebView container
- Message bridge protocol
- Performance baseline
- Integration examples

**Success Criteria**:
- 60fps empty scene
- Two-way communication
- Asset loading working

#### 3. Avatar → Phaser3 (Day 10)
**Deliverables**:
- 5 evolution sprite sheets
- Animation definitions
- Asset optimization guide
- Color palette compliance

**Success Criteria**:
- All animations smooth
- File sizes optimized
- Pixel-perfect rendering

#### 4. Game Dev → Testing (Day 14)
**Deliverables**:
- Complete combat system
- 6 boss implementations
- Control documentation
- Balance parameters

**Success Criteria**:
- All moves functional
- Bosses have unique patterns
- No crash bugs

## Communication Channels

### Daily Communication
- **9:00 AM**: Daily standup (15 min)
- **Format**: Yesterday/Today/Blockers
- **Location**: GitHub Issues daily thread

### Async Communication
- **GitHub Issues**: Feature discussions
- **Pull Requests**: Code reviews
- **Slack/Discord**: Quick questions
- **Documentation**: Long-form guides

### Weekly Sync
- **Monday**: Sprint planning
- **Wednesday**: Mid-week check
- **Friday**: Demo and retrospective

## Specialist Responsibilities

### Backend Specialist
**Primary**:
- Supabase project setup
- Database schema deployment
- Authentication implementation
- Real-time subscriptions

**Handoffs To**:
- Phaser3 (infrastructure)
- API Integration (endpoints)
- Testing (test data)

**Handoffs From**:
- Product Manager (requirements)
- Game Dev (data needs)

### Phaser3 Integration Specialist
**Primary**:
- WebView implementation
- Game engine setup
- Asset pipeline
- Performance optimization

**Handoffs To**:
- Game Dev (engine ready)
- Performance (metrics)
- Testing (integration)

**Handoffs From**:
- Backend (infrastructure)
- Avatar (assets)
- UI/UX (designs)

### Game Dev Specialist
**Primary**:
- Combat mechanics
- Boss AI implementation
- Game balance
- Special moves system

**Handoffs To**:
- Testing (gameplay)
- Performance (optimization needs)
- Avatar (animation requirements)

**Handoffs From**:
- Phaser3 (engine)
- Product Manager (game design)
- Testing (balance feedback)

### Avatar Evolution Specialist
**Primary**:
- Character sprite sheets
- Evolution animations
- Visual effects
- Asset optimization

**Handoffs To**:
- Phaser3 (sprite sheets)
- Game Dev (animations)
- Marketing (promotional assets)

**Handoffs From**:
- UI/UX (design specs)
- Product Manager (evolution stages)

### Performance Optimizer
**Primary**:
- 60fps optimization
- Memory management
- Load time reduction
- Device compatibility

**Handoffs To**:
- Testing (performance builds)
- DevOps (optimization configs)
- Phaser3 (performance feedback)

**Handoffs From**:
- All developers (performance issues)
- Testing (performance reports)

## Escalation Matrix

### Blocker Severity Levels

#### P0 - Critical Blocker
**Definition**: Stops all development
**Examples**: Backend down, build broken
**Escalation**: Immediate to Product Manager
**Response Time**: < 1 hour

#### P1 - Major Blocker
**Definition**: Blocks feature development
**Examples**: API not working, assets missing
**Escalation**: Same day to lead specialist
**Response Time**: < 4 hours

#### P2 - Minor Blocker
**Definition**: Workaround available
**Examples**: Optimization needed, UI polish
**Escalation**: Next standup
**Response Time**: < 24 hours

## Quality Gates

### Week 1 Gate
- [ ] Backend operational
- [ ] Auth working
- [ ] WebView renders Phaser
- [ ] 60fps baseline achieved

### Week 2 Gate
- [ ] Combat system complete
- [ ] 3+ bosses working
- [ ] Evolution system integrated
- [ ] Controls responsive

### Week 3 Gate
- [ ] All features integrated
- [ ] Performance optimized
- [ ] Analytics tracking
- [ ] No P0/P1 bugs

### Week 4 Gate
- [ ] All tests passing
- [ ] App store ready
- [ ] Marketing materials done
- [ ] Launch checklist complete

## Conflict Resolution

### Technical Conflicts
1. **Identify**: Document competing approaches
2. **Discuss**: Technical leads meeting
3. **Decide**: Product Manager breaks tie
4. **Document**: Record decision and rationale

### Resource Conflicts
1. **Priority**: Check roadmap priorities
2. **Negotiate**: Find compromise
3. **Escalate**: If needed, to Product Manager
4. **Adjust**: Update timeline if needed

### Design Conflicts
1. **User Focus**: What's best for users?
2. **Data**: Use analytics/research
3. **Test**: A/B if time permits
4. **Decide**: Product Manager final say

## Tools & Resources

### Development Tools
- **GitHub**: Source control and issues
- **Supabase**: Backend and database
- **PostHog**: Analytics and tracking
- **Expo**: React Native development
- **Phaser 3**: Game engine

### Communication Tools
- **GitHub Issues**: Primary async
- **Pull Requests**: Code reviews
- **Markdown Docs**: Documentation
- **Screen Recording**: Bug reports

### Testing Tools
- **Jest**: Unit testing
- **Detox**: E2E testing
- **Charles Proxy**: Network debugging
- **React DevTools**: Component debugging

## Success Metrics

### Individual Specialist Metrics
- **Delivery**: On-time handoffs
- **Quality**: Bug-free implementations
- **Communication**: Clear documentation
- **Collaboration**: Helpful reviews

### Team Metrics
- **Velocity**: Features per week
- **Quality**: Bugs per feature
- **Morale**: Team satisfaction
- **Learning**: Knowledge sharing

## Best Practices

### Code Reviews
- Review within 4 hours
- Constructive feedback
- Check for standards
- Test before approving

### Documentation
- Update with code
- Include examples
- Explain why, not just what
- Keep it searchable

### Testing
- Write tests first
- Cover edge cases
- Automate when possible
- Document test cases

### Communication
- Over-communicate
- Be specific
- Share context
- Acknowledge receipt

---

**Last Updated**: 2025-01-28
**Next Review**: Weekly at retrospective
**Owner**: Product Manager