# Product Requirements Document: 16bitFit (Updated)

| Author     | 16BitFit Studio |
|------------|------------------|
| Date       | July 10, 2025    |
| Version    | 1.2              |
| Status     | In Progress      |

---

## 1. Introduction

### 1.1. Purpose

To define the requirements for 16bitFit: a mobile fitness app that motivates users through Tamagotchi-style care mechanics and 16-bit RPG progression. The goal is to create a gamified wellness experience that transforms real-world actions into animated feedback and character development.

### 1.2. Scope

This PRD defines the MVP for iOS and Android. It includes:
- Character needs and evolution
- Sprite-based animation feedback system
- Logging UI
- Boss fight system via Phaser
- Supabase backend and real-time updates

### 1.3. References

- Game Design Document v1.1
- Technical Design Doc
- Style Guide
- Character System Doc

---

## 2. Goals and Objectives

### 2.1. Business Goals
- Encourage daily app use via avatar responsibility loop
- Foster health/nutrition habits through real-time feedback
- Build community around nostalgia-fueled motivation

### 2.2. Product Goals
- Let users “care for” a fitness avatar
- Display immediate, satisfying feedback for healthy actions
- Deliver visible growth or decline through character changes

---

## 3. User Personas

### 3.1. Persona: The Nostalgic Newcomer
Age 30–45, wants to build better habits using nostalgia and fun.

### 3.2. Persona: The Casual Gamer
Age 20–35, familiar with RPG mechanics, loves visual stat feedback.

---

## 4. User Stories

| ID     | Role   | I want to...                                | So that I can...                             | Priority |
|--------|--------|---------------------------------------------|----------------------------------------------|----------|
| US-01  | User   | Log a workout or meal                        | See my avatar react instantly                | High     |
| US-02  | User   | See my sprite animate when I log something   | Know my action had an effect                 | High     |
| US-03  | User   | Return to idle animation after feedback      | Always know the avatar’s baseline state      | High     |
| US-04  | User   | Watch my avatar change over time             | Feel motivated to keep going                 | High     |
| US-05  | User   | See different idle states                    | Recognize consequences of neglect or success | High     |

---

## 5. Features & Requirements

### 5.1. Tamagotchi Core Loop

| Requirement | Description |
|-------------|-------------|
| REQ-01 | Character has 2 core meters: Energy & Motivation |
| REQ-02 | Energy drains over time (hunger mechanic) |
| REQ-03 | Motivation drops after long inactivity |
| REQ-04 | Logging actions refills meters and increases stats |
| REQ-05 | Stats drop if actions are skipped for multiple days |

---

### 5.2. Sprite Animation System (NEW)

| Requirement | Description |
|-------------|-------------|
| REQ-06 | Sprite animations triggered on log actions |
| REQ-07 | Animations play for 1–2s, then revert to idle |
| REQ-08 | Idle state depends on updated stats |
| REQ-09 | Animation and idle states are defined as Figma variants |
| REQ-10 | Sound effects play with each animation |

**Variant Logic Table**:

| Trigger         | Variant         | Sound             | Duration | Idle Fallback |
|-----------------|------------------|--------------------|----------|----------------|
| Salad           | eating_healthy   | crunch.mp3         | 1.5s     | by stats |
| Protein         | flex             | flex.mp3           | 2s       | by stats |
| Workout         | thumbs_up        | success_chime.mp3  | 1.5s     | by stats |
| Junk Food/Skip  | damage_blink     | damage.mp3         | 1s       | by stats |

**Idle Decision Logic**:
- health < 40 → `idle_sick`
- weight > 70 → `idle_chubby`
- else → `idle_healthy`

---

### 5.3. Character Evolution

| Requirement | Description |
|-------------|-------------|
| REQ-11 | Character evolves in 4 stages: Newbie → Trainee → Fighter → Champion |
| REQ-12 | Evolves with streaks of care (Days 3, 14, 30) |
| REQ-13 | Devolves to "Slump" if neglected multiple days |

---

### 5.4. Logging System

| Requirement | Description |
|-------------|-------------|
| REQ-14 | Feed Character modal: “Healthy” or “Unhealthy” |
| REQ-15 | Train Character modal: Workout button |
| REQ-16 | Each log triggers a stat update and sprite animation |

---

### 5.5. Boss Battles

| Requirement | Description |
|-------------|-------------|
| REQ-17 | Built in Phaser, embedded via WebView |
| REQ-18 | RPG stats determine fight outcome |
| REQ-19 | Winning gives EXP + achievement |
| REQ-20 | Losing plays fail animation, no penalty |

---

### 5.6. Art & Audio

| Requirement | Description |
|-------------|-------------|
| REQ-21 | All sprites follow 16-bit pixel style |
| REQ-22 | Sprites defined as variants in Figma |
| REQ-23 | SFX in 8-bit retro style |
| REQ-24 | Background music uses motivational chiptunes |

---

## 6. Non-Functional Requirements

- **Performance**: Animations < 60fps, pixel rendering optimized
- **Accessibility**: High contrast, no flashing by default
- **Platform**: iOS 15+, Android 10+
- **Offline Support**: Queues actions via MMKV
- **Notifications**: Push alerts for low meters

---

## 7. Future Scope

- AI photo logging (meal scanner)
- Avatar customization from selfies
- Multiplayer boss battles
- Seasonal content (Halloween, New Year’s Challenge)

---

## 8. Appendix

**Figma Reference**: `CharacterSprite` component  
**Animation Control**: All states playable via Phaser animation config  
**Backend**: Supabase with real-time updates and decay jobs  
**State Management**: Zustand (for character) + React Query (API sync)

"""

# Save updated PRD
prd_path = Path("/mnt/data/16bitfit-prd-updated.md")
prd_path.write_text(updated_prd_text.strip())

prd_path.name

