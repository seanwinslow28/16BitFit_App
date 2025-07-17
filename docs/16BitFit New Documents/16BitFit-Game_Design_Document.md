# Game Design Document: 16bitFit (Updated)

**Version:** 1.1  
**Date:** July 10, 2025

---

## 1. Overview

### 1.1. Game Concept

**16bitFit** is a "Fitness Pet" RPG for iOS and Android. It fuses the character progression and combat of a 16-bit fighting game with the persistent, real-time care mechanics of a 90s digital pet. Players are responsible for the daily well-being of a pixelated avatar whose health, mood, and strength are directly tied to the player's real-life fitness and nutrition habits.

### 1.2. Genre

RPG, Simulation, Gamified Fitness

### 1.3. Target Audience

- **Nostalgic Newcomers (30–45):** Grew up with 8/16-bit games and Tamagotchis, looking for fun, low-pressure fitness motivation.
- **Casual Gamers (20–35):** Familiar with RPG stat systems and motivated by clear visual progression.

---

## 2. Gameplay Mechanics

### 2.1. Core Gameplay Loop

1. **Needs Deplete:** Energy and Motivation meters decrease in real time.
2. **Visual Cues:** Sprite state changes to reflect character status.
3. **User Logs Activity:** Food or workout input via buttons.
4. **Character Responds:** Sprite animates, plays SFX, stats update.
5. **Return to Idle State:** Based on updated health, happiness, weight.

---

### 2.2. Meters & Stats

- **Energy (Hunger):**  
  - Depletes over time  
  - Refilled by healthy/unhealthy meals  
  - At 0% → "Tired/Sick" state  
- **Motivation (Happiness):**  
  - Depletes with inactivity  
  - Refilled by workout logs  
  - Below 25% → "Sad" state  
- **RPG Stats:** HP, AP, EXP (used for boss fights and leveling)

---

### 2.3. Character Lifecycle

- **Stage 1: Newbie (Days 1–3)**  
- **Stage 2: Trainee (Days 4–14)**  
- **Stage 3: Fighter (Days 15–30)**  
- **Stage 4: Champion (Day 31+)**  
- **"Slump" State:** Caused by long-term neglect

---

### 2.4. Animation & Feedback System (New)

#### Overview
When the user performs an action, the character animates, plays a sound, then reverts to an idle sprite based on current stats.

#### Figma Component Structure
```json
{
  "component": "CharacterSprite",
  "type": "Variants",
  "frameSize": { "width": 64, "height": 64 },
  "variants": [
    {
      "name": "idle_healthy",
      "description": "Default state when stats are normal",
      "visibleByDefault": true,
      "animation": {
        "type": "loop",
        "duration": "2s",
        "fps": 4
      }
    },
    {
      "name": "idle_sick",
      "description": "Low health and low happiness state",
      "triggerConditions": { "health": "<40", "happiness": "<30" },
      "blinkEffect": true,
      "animation": {
        "type": "loop",
        "duration": "2s",
        "fps": 4
      }
    },
    {
      "name": "idle_chubby",
      "description": "Overweight state",
      "triggerConditions": { "weight": ">70" },
      "animation": {
        "type": "loop",
        "duration": "2s",
        "fps": 4
      }
    },
    {
      "name": "flex",
      "trigger": ["protein", "strength_training"],
      "sound": "flex.mp3",
      "animation": {
        "type": "play-once",
        "duration": "2s",
        "fps": 8
      }
    },
    {
      "name": "thumbs_up",
      "trigger": ["cardio"],
      "sound": "success_chime.mp3",
      "animation": {
        "type": "play-once",
        "duration": "1.5s",
        "fps": 8
      }
    },
    {
      "name": "eating_healthy",
      "trigger": ["salad", "healthy_food"],
      "sound": "crunch.mp3",
      "animation": {
        "type": "play-once",
        "duration": "1.5s",
        "fps": 8
      }
    },
    {
      "name": "damage_blink",
      "trigger": ["junkFood", "soda", "skip_workout"],
      "sound": "damage.mp3",
      "effect": "blink_red",
      "animation": {
        "type": "play-once",
        "duration": "1s",
        "fps": 12
      }
    }
  ]
}

