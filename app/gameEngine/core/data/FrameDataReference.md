# 16BitFit Frame Data Reference

## Overview
This document provides a quick reference for the comprehensive frame data system in 16BitFit. All frame data is calculated at 60fps (16.67ms per frame).

## Character Archetypes

### Warrior (Balanced)
- **Health**: 1000
- **Walk Speed**: 3.5
- **Strengths**: Balanced normals, strong uppercut, good fireball game
- **Weaknesses**: Average mobility, predictable gameplan

### Speedster (Rushdown)
- **Health**: 850
- **Walk Speed**: 4.5
- **Strengths**: Fast normals, excellent mobility, strong mixups
- **Weaknesses**: Low health, lower damage output

### Tank (Grappler)
- **Health**: 1200
- **Walk Speed**: 2.8
- **Strengths**: High damage, armor moves, command grabs
- **Weaknesses**: Slow movement, large hurtbox

## Frame Data Notation

- **Startup**: Frames before the move becomes active
- **Active**: Frames where the move can hit
- **Recovery**: Frames after active until neutral
- **On Hit/Block**: Frame advantage (+) or disadvantage (-)
- **KD**: Knockdown
- **xx**: Cancel notation

## Key Frame Data

### Universal Mechanics
- **Prejump**: 4 frames (all characters)
- **Block Startup**: 1 frame
- **Parry Window**: 6 frames
- **Throw Tech Window**: 7 frames

### Common Frame Traps
- **Warrior**: 5MP (+5) > 5LP (3f startup) = 2 frame gap
- **Speedster**: 5MP (+4) > 5LP (2f startup) = 2 frame gap  
- **Tank**: 5MP (+3) > 5LP (4f startup) = 1 frame gap

### Punish Options

#### Light Punishes (3-5 frames)
- **Warrior**: 5LP (3f) > 5MP xx special
- **Speedster**: 5LP (2f) > 5LP > 5MP xx special
- **Tank**: 5LP (4f) > 5MP

#### Heavy Punishes (8+ frames)
- **Warrior**: 5HP (8f) xx Dragon Punch
- **Speedster**: 5HP (7f) xx Lightning Legs
- **Tank**: Command Grab (5f) or 5HP (11f)

## Combo Theory

### Damage Scaling
1. 100% (1st-2nd hit)
2. 90% (3rd hit)
3. 80% (4th hit)
4. 70% (5th hit)
5. 60% (6th hit)
6. 50% (7th hit)
7. 40% (8th hit)
8. 30% (9th hit)
9. 20% (10th+ hits)

### Basic Combo Structure
1. **Starter**: Light/Medium normal
2. **Filler**: Chainable normals
3. **Linker**: Cancellable normal
4. **Ender**: Special move

### Example BnB Combos

#### Warrior
- `2LK > 2LP > 2MP xx Fireball` (130 damage)
- `j.HK > 5HP xx Dragon Punch` (250 damage)
- `CH 5HP > dash > 5MP > 5HP xx EX Hurricane` (380 damage)

#### Speedster  
- `5LP > 5LP > 5MP xx Lightning Legs` (120 damage)
- `j.MK (crossup) > 2LK > 2LP > 5MP xx EX Lightning` (180 damage)
- `6MK > 5MP xx Spinning Bird Kick` (220 damage)

#### Tank
- `5MP > 5HP` (235 damage)
- `j.HP > 5HP xx Command Grab` (310 damage)
- `Armor Charge > 5HP xx Ground Pound` (340 damage)

## Advanced Techniques

### Option Selects
- **Safe Jump**: Time jump attack to land and block if opponent DPs
- **Meaty**: Time attack to hit on first active frame of opponent's wakeup
- **Frame Kill**: Use specific moves to time perfect meaties

### Hit Confirms
- **Visual Confirm Window**: 16 frames
- **Audio Cue**: Hitstop freeze helps confirm
- **Buffer Window**: 10 frames for special inputs

### Defensive Options
- **Reversal Window**: 5 frames on wakeup
- **Guard Cancel**: During blockstun with meter
- **Alpha Counter**: Costs 50 meter, 12f startup

## Character-Specific Tech

### Warrior
- Fireball > FADC > Dragon Punch (corner carry)
- Meaty 5HP frame trap into counter hit combo
- Safe jump setups after throw

### Speedster
- Instant air dash mixups
- Wall jump reset situations  
- Lightning Legs pressure strings

### Tank
- Tick throw setups (5LP > Command Grab)
- Armor through projectiles
- Counter stance OS (beats throws and strikes)

## Frame Data Tips

1. **Learn Your Fastest Punish**: Know your character's fastest normal
2. **Practice Hit Confirms**: Use training mode to practice confirming into damage
3. **Understand Frame Traps**: Leave small gaps to catch mashing
4. **Respect Plus Frames**: Don't press buttons after blocking plus moves
5. **Use Frame Data**: Reference this data to optimize combos and punishes

## Updates
Frame data is subject to balance changes. Last updated: 2025-01-27