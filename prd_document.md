# Product Requirements Document: 16bitFit

**Author:** Sean Winslow  
**Date:** July 1, 2025  
**Version:** 1.0  
**Status:** In-Progress  

## 1. Introduction

### 1.1 Purpose
This document outlines the product requirements for "16bitFit," a gamified fitness and nutrition tracking application. 16bitFit aims to motivate users to build and maintain healthy habits by linking their real-world actions to the growth and success of a virtual, 16-bit character. This PRD defines the scope, features, and functionality for the initial prototype (MVP) and outlines a roadmap for future development.

### 1.2 Scope
The initial scope of this project is to develop a Minimum Viable Prototype (MVP) for iOS and Android. The MVP will focus on the core gameplay loop: manual user input for nutrition and exercise, character progression (growth/decay), and a basic, non-interactive "boss fight" mechanic to serve as a motivational goal. Future versions will explore health app integration and AI-powered features.

### 1.3 Definitions, Acronyms, and Abbreviations
- **PRD:** Product Requirements Document
- **MVP:** Minimum Viable Prototype
- **UI:** User Interface
- **UX:** User Experience
- **HP:** Health Points (Character's vitality)
- **AP:** Attack Power (Character's strength)
- **EXP:** Experience Points (Progress to the next level)
- **SFX:** Sound Effects
- **AI:** Artificial Intelligence

### 1.4 References
**Inspiration:** Street Fighter, Tamagotchi, 8-bit/16-bit era RPGs

### 1.5 Overview
This document details the goals, user stories, features, and requirements for 16bitFit. It will guide the design and development team in creating a product that is engaging, effective, and true to its retro-gamified vision.

## 2. Goals and Objectives

### 2.1 Business Goals
- Create a unique and engaging product in the crowded health and fitness app market by leveraging nostalgia and gamification
- Establish a core user base with the MVP to validate the concept and gather feedback for future iterations
- Develop a platform that can be expanded with premium features in the future (e.g., advanced AI coaching, cosmetic character items)

### 2.2 Product Goals
- Motivate users to make healthier choices by providing immediate, visual feedback through their character's status
- Make fitness and nutrition tracking fun and less of a chore
- Provide a clear sense of progression and achievement that is directly tied to the user's real-world efforts

## 3. User Personas

### 3.1 Persona 1: "The Nostalgic Newcomer"
- **Name:** Alex, Age 32
- **Background:** Works a desk job, grew up playing NES and Sega Genesis. Finds modern fitness apps to be sterile and boring. Wants to get back in shape but struggles with motivation.
- **Goals:** To find a fun way to stay accountable for diet and exercise. Wants to see tangible progress without complex charts and data.
- **Frustrations:** Feels intimidated by gym culture and overly complex calorie-tracking apps. Loses interest in activities that feel like work.

### 3.2 Persona 2: "The Casual Gamer"
- **Name:** Jordan, Age 24
- **Background:** Enjoys video games, particularly RPGs with leveling systems. Is moderately active but inconsistent with their routine.
- **Goals:** To find a system that "gamifies" their life and rewards them for consistency.
- **Frustrations:** Gets bored with repetitive workout routines. Is motivated by leveling up and beating challenges in games, but hasn't found a way to apply that to real life.

## 4. User Stories

| ID | As a... | I want to... | So that I can... | Priority |
|---|---|---|---|---|
| US-01 | New User | Create a 16-bit character from a few preset options | Start my fitness journey with a personalized avatar | High |
| US-02 | User | Log a healthy meal with a single tap | See my character get stronger and gain EXP | High |
| US-03 | User | Log an unhealthy meal or snack | Understand the immediate negative impact on my character's health (HP) | High |
| US-04 | User | Log a completed workout | Increase my character's Attack Power (AP) and EXP | High |
| US-05 | User | See my character's appearance change | Get visual feedback on whether I am succeeding or failing in my goals | High |
| US-06 | User | See my character level up after gaining enough EXP | Feel a sense of accomplishment and see a permanent increase in my character's stats | High |
| US-07 | User | Challenge a "boss" | Test my character's strength and have a clear goal to work towards | High |
| US-08 | User | Receive a workout tip if I lose the boss fight | Be motivated to improve for the next attempt | Medium |
| US-09 | User (Future) | Sync my workout data from my Health App/Apple Watch | Automate the logging process and ensure accuracy | Future |
| US-10 | User (Future) | Take a photo of myself to generate a pixelated avatar | Have a truly personalized character that looks like me | Future |
| US-11 | User (Future) | Take a photo of my meal to get an automatic nutritional breakdown | Remove the manual effort of logging and get detailed insights into my diet | Future |

## 5. Features & Requirements

### 5.1 Feature: Character Creation & Management (MVP)
**Description:** Users will create and manage their 16bitFit avatar.

**Requirements:**
- **REQ-01:** On first launch, the user must be prompted to choose from 3-4 predefined character sprites
- **REQ-02:** The main screen ("Dojo") must display the character sprite prominently in the center
- **REQ-03:** The UI must display the character's current HP, AP, and an EXP bar showing progress to the next level
- **REQ-04:** The character sprite must have distinct visual states: neutral, healthy/strong, and unhealthy/weak. The app will switch between these states based on the character's HP and recent user actions

### 5.2 Feature: Manual Logging System (MVP)
**Description:** The core input mechanism for the user to report their activities.

**Requirements:**
- **REQ-05:** The main screen must have two primary buttons: "Feed Character" and "Train Character"
- **REQ-06 (Feeding):** Tapping "Feed Character" presents two options: "Healthy Meal" and "Unhealthy Treat"
  - Selecting "Healthy Meal" will grant EXP and regenerate HP. A positive sound effect will play
  - Selecting "Unhealthy Treat" will deduct HP. A negative sound effect will play
- **REQ-07 (Training):** Tapping "Train Character" presents two options: "Completed Workout" and "Skipped Workout"
  - Selecting "Completed Workout" will grant AP and EXP. A "power-up" sound effect will play, and the character will perform a brief workout animation
  - Selecting "Skipped Workout" will deduct a small amount of EXP. A "power-down" sound effect will play

### 5.3 Feature: Progression and Leveling (MVP)
**Description:** The system for character growth and user reward.

**Requirements:**
- **REQ-08:** When the EXP bar is filled, a "Level Up" sequence will trigger
- **REQ-09:** Leveling up will permanently increase the character's max HP and base AP
- **REQ-10:** The character's level number will be clearly displayed on the main screen

### 5.4 Feature: The Boss Fight (MVP)
**Description:** A recurring challenge that serves as a motivational goal and a test of the character's strength.

**Requirements:**
- **REQ-11:** A "Fight Boss" button will be available on the main screen
- **REQ-12:** The fight's outcome will be determined by a simple stat check: `IF character_AP >= boss_AP_requirement THEN Win ELSE Lose`. This is not an interactive fight in the MVP
- **REQ-13:** A "Victory" screen will be shown upon winning, awarding a large EXP bonus
- **REQ-14:** A "Defeat" screen will be shown upon losing. This screen may include a motivational tip

### 5.5 Feature: Art & Sound (MVP)
**Description:** The aesthetic layer of the application.

**Requirements:**
- **REQ-15:** All visual assets (sprites, UI elements, backgrounds) must be in a consistent 16-bit pixel art style
- **REQ-16:** Sound effects must be in a corresponding retro/chiptune style
- **REQ-17:** The UI must be simple, intuitive, and reminiscent of classic video game menus

## 6. Non-Functional Requirements

### 6.1 Usability
The app must be intuitive for users who are familiar with both mobile apps and classic video games. The core loop of logging and checking on the character should take no more than 30 seconds.

### 6.2 Performance
The app must be lightweight and responsive. Animations and transitions should be smooth, with no noticeable lag on target devices (mid-range smartphones and newer).

### 6.3 Platforms
The MVP will be developed for iOS (iOS 15+) and Android (Android 10+).

## 7. Future Scope / Roadmap

- **Version 1.1:** Health App Integration (Apple Health & Google Fit) to automate workout logging
- **Version 1.2:** Expanded Gameplay (more meal/workout types, equipment unlocks, different bosses)
- **Version 2.0:** AI Meal Scanner (photo-based food logging and analysis)
- **Version 2.1:** AI Avatar Creator (photo-to-pixel-art character generation)
- **Post-v2:** Social Features (sharing progress, friend leaderboards, co-op boss fights)

## 8. Success Metrics

### 8.1 User Engagement
- Daily Active Users (DAU) and retention rates
- Average session duration and frequency
- Character progression milestones reached

### 8.2 Health Impact
- User-reported improvements in eating habits
- Workout consistency and frequency
- Long-term habit formation (90+ day retention)

### 8.3 Business Metrics
- User acquisition cost vs. lifetime value
- App store ratings and reviews
- Feature usage analytics (most/least used features)

## 9. Risk Assessment

### 9.1 Technical Risks
- **Risk:** Cross-platform compatibility issues
- **Mitigation:** Use React Native for shared codebase and extensive testing

### 9.2 Market Risks
- **Risk:** Saturated fitness app market
- **Mitigation:** Unique gamification approach and retro aesthetic differentiation

### 9.3 User Adoption Risks
- **Risk:** Users may lose interest in character progression
- **Mitigation:** Continuous content updates and social features in future versions

---

**Document Status:** Living document, updated as requirements evolve through user feedback and technical discovery.
