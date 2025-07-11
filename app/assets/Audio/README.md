# 16BitFit Audio Assets

This folder contains all audio assets for the 16BitFit app.

## Structure

### SFX (Sound Effects)
- `button_press.mp3` - UI button interactions
- `workout_complete.mp3` - Workout action completion
- `meal_healthy.mp3` - Healthy meal logged
- `meal_junk.mp3` - Junk food logged
- `stat_increase.mp3` - Character stat increase
- `stat_decrease.mp3` - Character stat decrease
- `level_up.mp3` - Character level up
- `evolution.mp3` - Character evolution stage up
- `battle_start.mp3` - Boss battle begins
- `battle_victory.mp3` - Boss battle won
- `battle_defeat.mp3` - Boss battle lost
- `health_sync.mp3` - Health data synchronized
- `notification.mp3` - General notifications
- `character_happy.mp3` - Character happiness animations
- `character_sad.mp3` - Character sadness animations

### Music
- `background_music.mp3` - Main background music loop
- `battle_music.mp3` - Boss battle background music
- `victory_music.mp3` - Victory celebration music

## Audio Requirements

All audio files should be:
- **Format**: MP3 or OGG for web compatibility
- **Bitrate**: 128kbps maximum (for mobile optimization)
- **Duration**: 
  - SFX: 0.5-3 seconds
  - Music: 30-60 seconds (looped)
- **Style**: 8-bit/16-bit chiptune aesthetic
- **Volume**: Normalized to prevent clipping

## Implementation Notes

- All audio files are loaded via the AudioService
- Sound effects are triggered by user actions
- Background music loops continuously with volume controls
- Audio can be muted via app settings
- Files are lazy-loaded to optimize app startup