# How to Use This TDD with AI Coding Assistants

## Overview

This guide shows you exactly how to leverage the Technical Design Document with Claude Code, GitHub Copilot, or other AI assistants to build 16BitFit efficiently.

## Phase 1: Project Setup (Feed this to Claude Code)

### Prompt 1: Initial Setup
```
I'm building a React Native app called 16BitFit with Expo. Here's my technical design document [paste TDD].

Please help me:
1. Set up the Expo project with TypeScript
2. Install all required dependencies
3. Create the folder structure as defined in the TDD
4. Set up Supabase client with proper TypeScript types
5. Create the initial navigation structure

Focus on the Mobile-Specific Considerations section for the folder structure.
```

### Prompt 2: Database Setup
```
Using the Database Schema section from my TDD, please:
1. Generate the complete SQL migration file for Supabase
2. Include all tables, indexes, and RLS policies
3. Add helpful comments explaining each table's purpose
4. Create TypeScript interfaces matching each table

Make sure to include the computed power_level column and all check constraints.
```

## Phase 2: Core Features Implementation

### Prompt 3: Character State Management
```
Based on the API Specification and Database Schema in my TDD:
1. Create the Zustand store for character management (characterStore.ts)
2. Implement all the character-related API calls using Supabase
3. Add proper TypeScript types for all responses
4. Include error handling and loading states
5. Set up the real-time subscription for character updates

Reference the "Real-time Subscriptions" section for the subscription implementation.
```

### Prompt 4: Game Actions System
```
Implement the action logging system from my TDD:
1. Create the UI components for healthy/unhealthy action buttons
2. Implement the POST endpoints for food, workout, and skip actions
3. Add the stat calculation logic as defined in the schema
4. Include optimistic updates in the UI
5. Add the action queue for offline support as shown in "Offline Support"

Use the exact stat changes from the original game design document:
- Salad: health +5, weight -2, stamina +3
- Burger: health -3, weight +5, stamina -2
[include full list]
```

### Prompt 5: Phaser Integration
```
Create the Phaser game integration for character animations:
1. Set up the GameWebView component to embed Phaser
2. Implement the character sprite animations (idle, flex, damage)
3. Create the bridge between React Native and Phaser for commands
4. Add the 8-bit sound effects triggers
5. Implement the pixel-perfect rendering settings

The character should display in a 400x300 canvas with 3x scaling.
```

## Phase 3: Health Integration

### Prompt 6: HealthKit Integration
```
Implement Apple HealthKit integration based on the TDD:
1. Set up React Native Health with proper permissions
2. Create the HealthKitSync service
3. Implement the batch sync endpoint from the API spec
4. Map HealthKit workout types to our game actions:
   - Running/Walking → 'run' action
   - Strength Training → 'lift' action
   - Yoga/Stretching → 'stretch' action
5. Add the 30-minute sync interval

Include proper error handling for permission denials.
```

## Phase 4: Advanced Features

### Prompt 7: Boss Battle System
```
Implement the boss battle feature:
1. Create the boss data based on power level tiers
2. Implement the battle logic (damage calculation, win/loss)
3. Create the battle animation screen
4. Add the rewards system (experience, achievements)
5. Store battle results using the boss_battles table schema

Boss tiers from game design:
- Training Dummy: 0-30 power
- Gym Bully: 31-50 power
- Fitness Guru: 51-70 power
```

### Prompt 8: Daily Decay System
```
Set up the daily decay Edge Function:
1. Copy the daily-decay function from the TDD
2. Set up the Supabase cron job to run daily at 3 AM
3. Implement the decay notification system
4. Add visual indicators when stats have decayed
5. Create the "last_decay_at" timestamp logic

Decay rates: health -1, strength -1, stamina -2, weight +1, happiness -2
```

## Phase 5: UI/UX Implementation

### Prompt 9: NES.css Styling
```
Apply NES.css styling to all screens:
1. Set up the Press Start 2P font globally
2. Create NES-styled containers for each screen
3. Implement the button variants (success, error, primary)
4. Add progress bars for all stats with proper colors
5. Create the pixel-perfect character arena background

Use the exact color scheme:
- Health bar: is-error (red)
- Strength bar: is-warning (orange)
- Stamina bar: is-primary (blue)
```

## Phase 6: Testing & Deployment

### Prompt 10: Testing Setup
```
Set up the testing infrastructure:
1. Configure Jest for React Native with TypeScript
2. Create unit tests for stat calculations
3. Add integration tests for Supabase operations
4. Mock HealthKit for testing
5. Create snapshot tests for key components

Use the test examples from the Testing Strategy section.
```

## Best Practices for AI Assistance

### 1. Chunk Your Requests
Don't try to implement everything at once. Break it down:
- One feature per prompt
- Reference specific sections of the TDD
- Include relevant data/formulas

### 2. Provide Context
Always include:
- The relevant section from the TDD
- Any dependencies already implemented
- Specific requirements or constraints

### 3. Iterate and Refine
- Test each implementation before moving on
- Ask for improvements or optimizations
- Request error handling and edge cases

### 4. Example: Perfect Prompt Structure
```
Context: I'm implementing [specific feature] for my 16BitFit app.

From my TDD:
[Paste relevant section]

Already implemented:
- Supabase client setup
- Basic navigation
- Character store

Please implement:
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

Additional requirements:
- Use TypeScript
- Include error handling
- Add loading states
- Follow the exact schema definitions
```

## Common AI Pitfalls to Avoid

### 1. Schema Mismatches
Always provide the exact database schema to avoid type mismatches.

### 2. Missing Dependencies
List all installed packages when asking for new features.

### 3. State Management Conflicts
Be clear about which state management solution you're using (Zustand in this case).

### 4. Platform-Specific Code
Specify iOS vs Android when asking for platform-specific features.

## Debugging with AI

When something doesn't work, provide:
1. The error message
2. The relevant code
3. The expected behavior from the TDD
4. What you've already tried

Example:
```
I'm getting a TypeScript error when implementing the character stats update.

Error: Type 'number' is not assignable to type 'never'

Current code:
[paste code]

From TDD, the stats should be:
[paste schema]

How do I fix this type error?
```

## Portfolio Value

When complete, you'll have:
- **Working Code**: A fully functional app following industry best practices
- **Technical Artifacts**: Database schemas, API docs, and architecture diagrams
- **AI Collaboration Skills**: Demonstrated ability to guide AI tools effectively
- **Full-Stack Understanding**: From React Native to Edge Functions

This systematic approach shows potential employers you can:
1. Plan complex technical systems
2. Communicate effectively with AI tools
3. Implement modern app architecture
4. Think through edge cases and scalability