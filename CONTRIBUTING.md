# Contributing to 16bitFit

Thank you for your interest in contributing to 16bitFit! We welcome contributions from developers, designers, health experts, and gaming enthusiasts.

## 🎯 Ways to Contribute

### 🎨 Design Contributions
- **Pixel Art:** Character sprites, UI elements, boss designs
- **Sound Design:** Chiptune music and 8-bit sound effects
- **UX Design:** User interface improvements and user flow optimization
- **Animation:** Character animations and UI transitions

### 💻 Code Contributions
- **Frontend Development:** React Native components and screens
- **Game Logic:** Character progression and battle systems
- **Performance:** Optimization and bug fixes
- **Testing:** Unit tests and integration tests

### 📝 Documentation
- **Technical Documentation:** API documentation and code comments
- **User Guides:** Help documentation and tutorials
- **Translation:** Localization for different languages

### 🎮 Game Design
- **Balance Testing:** Character progression and difficulty tuning
- **Feature Ideas:** New gameplay mechanics and features
- **User Research:** Testing and feedback collection

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- React Native development environment
- Git version control
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/16bitfit.git
   cd 16bitfit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   
   # For iOS (Mac only)
   cd ios && pod install && cd ..
   ```

3. **Start Development Server**
   ```bash
   npm start
   
   # In separate terminals:
   npm run ios     # For iOS simulator
   npm run android # For Android emulator
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run lint
   ```

## 📋 Development Guidelines

### Code Style
- Follow ESLint configuration provided
- Use TypeScript for new files when possible
- Write descriptive commit messages
- Add JSDoc comments for functions
- Follow React Native best practices

### Git Workflow
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes with clear, atomic commits
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request with detailed description

### Commit Message Format
```
type(scope): description

feat(character): add level up animation
fix(stats): correct HP calculation bug
docs(readme): update installation instructions
style(ui): improve button styling
test(logic): add unit tests for game mechanics
```

**Types:** feat, fix, docs, style, refactor, test, chore

## 🎨 Asset Guidelines

### Pixel Art Standards
- **Resolution:** 16x16, 32x32, or 64x64 pixels for sprites
- **Color Palette:** Limited 16-bit style palette
- **Format:** PNG with transparency
- **Style:** Consistent with existing assets

### Audio Standards
- **Format:** WAV for sound effects, MP3 for music
- **Quality:** 44.1kHz, 16-bit minimum
- **Style:** Chiptune/8-bit aesthetic
- **Length:** <2 seconds for effects, <30 seconds for loops

### File Organization
```
assets/
├── sprites/
│   ├── characters/
│   ├── ui/
│   └── backgrounds/
├── sounds/
│   ├── effects/
│   └── music/
└── fonts/
```

## 🧪 Testing Guidelines

### Required Tests
- **Unit Tests:** All game logic functions
- **Component Tests:** UI component rendering
- **Integration Tests:** Complete user flows
- **Manual Testing:** Device testing on iOS/Android

### Test Structure
```javascript
describe('Character System', () => {
  test('should increase HP when fed healthy meal', () => {
    const character = { currentHP: 50, maxHP: 100 };
    const result = feedCharacter(character, 'healthy_meal');
    expect(result.currentHP).toBe(70);
  });
});
```

## 📝 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] No merge conflicts with main branch
- [ ] Screenshots included (for UI changes)

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No regressions introduced

## Screenshots (if applicable)
[Include before/after screenshots for UI changes]

## Checklist
- [ ] Self-review completed
- [ ] Code follows project guidelines
- [ ] Tests added for new functionality
- [ ] Documentation updated
```

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Describe the Bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Tap on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
Add screenshots if applicable

**Device Info**
- OS: [e.g. iOS 16.0, Android 12]
- Device: [e.g. iPhone 14, Samsung Galaxy S21]
- App Version: [e.g. 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature

**Problem It Solves**
What user problem does this address?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, or references
```

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- In-app credits screen
- Release notes for significant contributions

### Contribution Types
- **🎨 Design:** Visual assets, UX improvements
- **💻 Code:** Features, bug fixes, optimizations
- **📝 Docs:** Documentation, tutorials
- **🧪 Testing:** QA, bug reports, test coverage
- **💡 Ideas:** Feature suggestions, feedback
- **🌐 Translation:** Localization efforts

## 📞 Getting Help

### Communication Channels
- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** General questions and ideas
- **Discord:** Real-time chat and collaboration
- **Email:** [maintainer-email@example.com]

### Code Review Process
1. **Automated Checks:** CI/CD pipeline runs tests and linting
2. **Peer Review:** At least one maintainer reviews code
3. **Testing:** Manual testing for UI/UX changes
4. **Approval:** Maintainer approval required for merge

## 📜 Code of Conduct

### Our Standards
- **Respectful Communication:** Be kind and constructive
- **Inclusive Environment:** Welcome contributors of all backgrounds
- **Collaborative Spirit:** Help others learn and grow
- **Focus on Quality:** Strive for excellent user experience

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Spam or off-topic discussions
- Sharing private information without permission

### Enforcement
Project maintainers are responsible for clarifying standards and taking corrective action. Violations may result in temporary or permanent bans from the project.

## 🎮 Game Design Philosophy

When contributing to game mechanics, keep these principles in mind:

### Core Values
- **Simplicity:** Easy to understand, hard to master
- **Immediate Feedback:** Visual and audio responses to actions
- **Positive Reinforcement:** Reward good habits, gentle correction for bad ones
- **Authentic Retro Feel:** True to 16-bit gaming aesthetics
- **Health-First:** Always prioritize user wellbeing over engagement

### Feature Evaluation Criteria
1. **Does it support healthy habits?**
2. **Is it fun and engaging?**
3. **Does it fit the retro aesthetic?**
4. **Is it technically feasible?**
5. **Does it align with user personas?**

---

Thank you for helping make 16bitFit the best gamified fitness app possible! 🎮💪

**Ready to contribute?** Check out our [good first issues](https://github.com/your-username/16bitfit/labels/good%20first%20issue) to get started!
