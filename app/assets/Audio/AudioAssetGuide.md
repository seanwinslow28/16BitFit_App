# Audio Asset Guide for 16BitFit Battle System

This guide explains how to add audio files to enhance your fighting game experience.

## Directory Structure

```
Audio/
├── Music/
│   ├── battle_normal.mp3      # Normal battle music (looping)
│   ├── battle_intense.mp3     # Intense battle music (< 30% health)
│   ├── victory.mp3            # Victory fanfare
│   └── defeat.mp3             # Defeat music
├── SFX/
│   ├── punch_light_1.wav      # Light punch variations
│   ├── punch_light_2.wav
│   ├── punch_heavy_1.wav      # Heavy punch variations
│   ├── punch_heavy_2.wav
│   ├── kick_light_1.wav       # Kick sounds
│   ├── kick_heavy_1.wav
│   ├── block_1.wav            # Block variations
│   ├── block_2.wav
│   ├── special_charge.wav     # Special move charging
│   ├── special_release.wav    # Special move execution
│   ├── jump.wav               # Jump sound
│   ├── land_soft.wav          # Soft landing
│   ├── land_hard.wav          # Hard landing
│   ├── dash.wav               # Dash movement
│   ├── explosion.wav          # Environmental explosion
│   ├── steam_vent.wav         # Steam vent hazard
│   ├── crate_fall.wav         # Falling crate impact
│   ├── menu_select.wav        # UI navigation
│   └── menu_confirm.wav       # UI confirmation
└── Voice/
    ├── player_hurt_1.wav      # Player pain sounds
    ├── player_hurt_2.wav
    ├── player_attack_1.wav    # Player attack grunts
    ├── player_attack_2.wav
    ├── player_victory.wav     # Victory voice clip
    ├── boss_taunt_1.wav       # Boss taunts
    └── boss_taunt_2.wav

```

## Audio Format Recommendations

### Music Files
- **Format**: MP3 or OGG (OGG preferred for better compression)
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Duration**: 
  - Battle music: 1-2 minutes (will loop)
  - Victory/Defeat: 5-10 seconds

### Sound Effects
- **Format**: WAV or OGG
- **Bitrate**: Uncompressed WAV or high-quality OGG
- **Sample Rate**: 44.1 kHz
- **Duration**: 0.1-2 seconds per sound
- **Variations**: Multiple versions prevent repetition

### Voice Clips
- **Format**: WAV or OGG
- **Sample Rate**: 44.1 kHz
- **Duration**: 0.5-2 seconds
- **Processing**: Normalize audio levels

## Recommended Free Resources

### 8-bit Music Generators
- BeepBox (https://beepbox.co)
- FamiStudio (NES-style music)
- LMMS (Free DAW)

### Sound Effect Resources
- freesound.org (CC licensed sounds)
- opengameart.org (Game-specific assets)
- zapsplat.com (Free with account)
- sfxr/Bfxr (8-bit sound generator)

### Voice Recording Tips
- Use any smartphone or computer mic
- Record in a quiet room
- Keep consistent distance from mic
- Process with free tools like Audacity

## Implementation Notes

1. **File Naming**: Follow the exact naming convention shown above
2. **Fallback System**: The game will use generated sounds if files are missing
3. **Performance**: Keep total audio assets under 10MB for mobile
4. **Testing**: Use the in-game audio settings panel to adjust volumes

## Current Features Using Audio

### Dynamic Music System
- Music intensity changes based on player health
- Smooth crossfading between tracks
- Victory/defeat sequences

### 3D Positional Audio
- Sounds pan left/right based on position
- Volume decreases with distance
- Environmental sounds are spatially positioned

### Sound Variations
- Multiple versions of hit sounds
- Random pitch variation for natural feel
- Prevents repetitive audio

### Audio Ducking
- Music volume lowers during special moves
- Important sounds take priority

## Adding Your Own Audio

1. Place files in the correct folders following the naming convention
2. The game will automatically detect and use them
3. Use the audio settings panel (speaker icon) to test
4. Adjust individual volume categories as needed

## Tips for 8-bit Style Audio

- Use square/triangle/noise waves
- Limit to 4-5 simultaneous sounds
- Keep frequency range limited (like NES)
- Add slight distortion/bitcrushing
- Use short, punchy sounds

The audio system is designed to enhance gameplay without requiring audio files. However, adding custom audio will significantly improve the player experience!