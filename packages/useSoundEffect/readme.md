# @useverse/useSoundEffect

A powerful, production-ready React hook for managing sound effects with advanced features including **audio cropping**, **smooth volume transitions**, **random playback**, and **stable dependencies** for safe use in React hooks.

Perfect for adding interactive audio, ambient loops, UI feedback sounds, and professional audio experiences to your applications.

---

## ✨ Features

- 🎵 **Audio Cropping** - Play specific segments of audio files (startFrom/stopAt)
- 🎚️ **Smooth Transitions** - Professional fade in/out effects with configurable duration
- 🎲 **Random Playback** - Intelligent scheduling with customizable intervals
- 🔒 **Stable Dependencies** - Safe to use in `useEffect` without infinite loops
- 🎛️ **Dynamic Volume Control** - Adjust volume in real-time during playback
- ♻️ **Loop Support** - Seamless looping with optional transitions
- ⚡ **Autoplay** - Start playing immediately on mount
- 🧹 **Automatic Cleanup** - Proper memory management and cleanup
- 📦 **Zero Dependencies** - Uses native Web Audio APIs
- 💪 **TypeScript** - Full type safety with comprehensive JSDoc

---

## 📦 Installation

```bash
npm install @useverse/usesoundeffect
```

---

## 🚀 Quick Start

```tsx
"use client";

import useSoundEffect from '@useverse/usesoundeffect';

export default function App() {
  const sound = useSoundEffect('/sounds/notify.mp3', {
    volume: 0.7,
  });

  return (
    <div>
      <button onClick={sound.play}>Play Sound</button>
      <button onClick={sound.stop}>Stop Sound</button>
      <p>Status: {sound.isPlaying ? 'Playing' : 'Stopped'}</p>
    </div>
  );
}
```

---

## 📚 Advanced Examples

### Audio Cropping

Play only a specific portion of an audio file:

```tsx
const snippet = useSoundEffect('/sounds/music.mp3', {
  startFrom: 10,  // Start at 10 seconds
  stopAt: 30,     // Stop at 30 seconds
});

// Plays seconds 10-30 of the track
<button onClick={snippet.play}>Play 20-Second Snippet</button>
```

### Smooth Fade Transitions

Create professional-sounding fade in/out effects:

```tsx
const ambient = useSoundEffect('/sounds/ambient.mp3', {
  loop: true,
  transitionStart: 2,  // 2 second fade in
  transitionEnd: 2,    // 2 second fade out when stopped
});

<button onClick={ambient.play}>Fade In</button>
<button onClick={ambient.stop}>Fade Out</button>
```

### Cropped Audio with Transitions

Combine cropping and fades for polished audio segments:

```tsx
const intro = useSoundEffect('/sounds/song.mp3', {
  startFrom: 15,       // Start at 15 seconds
  stopAt: 45,          // Stop at 45 seconds
  transitionStart: 3,  // Fade in over 3 seconds (15s-18s)
  transitionEnd: 3,    // Fade out over 3 seconds (42s-45s)
});

// Timeline:
// 15s: Start at volume 0
// 15s-18s: Fade in to target volume
// 18s-42s: Play at full volume
// 42s-45s: Fade out to volume 0
// 45s: Stop
```

### Background Music with Autoplay

Start playing automatically when the component mounts:

```tsx
const bgMusic = useSoundEffect('/sounds/background.mp3', {
  volume: 0.3,
  loop: true,
  autoplay: true,
  transitionStart: 4,  // Smooth 4 second fade in
});

<button onClick={bgMusic.stop}>Mute Background</button>
```

### Random Playback

Play sounds at unpredictable intervals for ambient effects:

```tsx
const chime = useSoundEffect('/sounds/chime.mp3', {
  playRandomly: true,
  minInterval: 5000,   // Minimum 5 seconds between plays
  maxInterval: 15000,  // Maximum 15 seconds between plays
  transitionStart: 0.5,
  transitionEnd: 0.5,
});

<button onClick={chime.stopRandom}>Stop Random Chimes</button>
<button onClick={chime.startRandom}>Resume Random Chimes</button>
```

### Dynamic Volume Control

Adjust volume in real-time with sliders or buttons:

```tsx
const sound = useSoundEffect('/sounds/effect.mp3');

<div>
  <input
    type="range"
    min="0"
    max="1"
    step="0.1"
    value={sound.currentVolume}
    onChange={(e) => sound.adjustVolume(parseFloat(e.target.value))}
  />
  <span>{Math.round(sound.currentVolume * 100)}%</span>
</div>
```

### Safe Dependency Usage

The returned object is stable and safe to use in React dependencies:

```tsx
const notification = useSoundEffect('/sounds/notify.mp3');

useEffect(() => {
  if (hasNewMessage) {
    notification.play(); // ✅ Safe - won't cause infinite loops
  }
}, [hasNewMessage, notification]); // ✅ notification is stable
```

---

## ⚙️ API Reference

### Options

| Option            | Type      | Default   | Description                                                                                         |
| ----------------- | --------- | --------- | --------------------------------------------------------------------------------------------------- |
| `volume`          | `number`  | `1`       | Initial volume (0 to 1).                                                                            |
| `preload`         | `boolean` | `true`    | Preload audio on mount for faster playback.                                                         |
| `loop`            | `boolean` | `false`   | Loop playback continuously.                                                                         |
| `autoplay`        | `boolean` | `false`   | Automatically play on mount.                                                                        |
| `playRandomly`    | `boolean` | `false`   | Play at random intervals.                                                                           |
| `minInterval`     | `number`  | `5000`    | Minimum delay between random plays (ms).                                                            |
| `maxInterval`     | `number`  | `15000`   | Maximum delay between random plays (ms).                                                            |
| `startFrom`       | `number`  | `0`       | Start playback from this timestamp (seconds). Use for audio cropping.                               |
| `stopAt`          | `number`  | undefined | Stop playback at this timestamp (seconds). Use for audio cropping.                                  |
| `transitionStart` | `number`  | `0`       | Fade in duration at the start (seconds). Creates smooth volume transition from 0 to target volume.  |
| `transitionEnd`   | `number`  | `0`       | Fade out duration at the end (seconds). Creates smooth volume transition from target volume to 0.   |

### Return Values

| Property         | Type                                 | Description                                                              |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `play`           | `() => void`                         | Play the sound effect with all configured options.                       |
| `stop`           | `() => void`                         | Stop playback immediately and reset position.                            |
| `startRandom`    | `() => void`                         | Start random playback scheduling.                                        |
| `stopRandom`     | `() => void`                         | Stop random playback scheduling (doesn't stop current audio).            |
| `adjustVolume`   | `(newVolume: number) => number`      | Adjust volume (0-1). Returns the clamped volume value.                   |
| `isPlaying`      | `boolean`                            | Whether audio is currently playing.                                      |
| `currentVolume`  | `number`                             | Current volume level (0-1).                                              |

**Note:** All returned functions are stable (memoized) and safe to use as dependencies in `useEffect`, `useCallback`, etc.

---

## 🎯 How Transitions Work

### Fade In (transitionStart)

1. Audio begins at volume 0
2. Gradually increases to target volume over the specified duration
3. Uses 50 interpolation steps for smooth, professional-quality transitions
4. Audio plays immediately (non-blocking)

### Fade Out (transitionEnd)

1. When using `stopAt`, fade begins at `stopAt - transitionEnd`
2. Gradually decreases from target volume to 0
3. Audio stops automatically when fade completes
4. Works seamlessly with cropped audio segments

### Example Timeline

```tsx
useSoundEffect('/audio.mp3', {
  startFrom: 10,
  stopAt: 40,
  transitionStart: 5,
  transitionEnd: 5,
});

// Playback Timeline:
// 10s: ▶️  Start at volume 0
// 10s-15s: 📈 Fade in from 0 to target volume
// 15s-35s: 🔊 Play at full target volume
// 35s-40s: 📉 Fade out from target volume to 0
// 40s: ⏹️  Stop playback
```

---

## 🔧 Migration from v1.x

### Stable Dependencies

```tsx
// ❌ Old (could cause infinite loops)
const { play, stop } = useSoundEffect('/sound.mp3');

useEffect(() => {
  play(); // Warning: play reference changes
}, [play]);

// ✅ New (stable and safe)
const sound = useSoundEffect('/sound.mp3');

useEffect(() => {
  sound.play(); // Safe: sound object is stable
}, [sound]);
```

### New stopRandom Method

```tsx
// ❌ Old (no way to stop random playback)
const { startRandom } = useSoundEffect('/chime.mp3', {
  playRandomly: true
});

// ✅ New (full control)
const sound = useSoundEffect('/chime.mp3', {
  playRandomly: true
});

<button onClick={sound.stopRandom}>Pause Random</button>
<button onClick={sound.startRandom}>Resume Random</button>
```

---

## 💡 Use Cases

- 🔔 **Notification sounds** - Success, error, message alerts
- 🖱️ **UI feedback** - Click sounds, hover effects, button interactions
- 🌧️ **Ambient effects** - Rain, forest, ocean backgrounds
- 🎮 **Game audio** - Sound effects, background music, UI sounds
- ⏰ **Periodic alerts** - Reminders, timers, alarms
- 🎵 **Music players** - Intro/outro segments, preview clips
- 🎬 **Media applications** - Trailers, teasers, sample clips
- 🧘 **Meditation apps** - Timed sound sessions with fade transitions

---

## 🧠 Technical Notes

### Performance

- Audio elements are properly cleaned up on unmount
- Only one audio instance per hook instance
- Fade intervals are cleared when not in use
- Random playback uses `setTimeout` (not `setInterval`) for better control
- Preloading is optional and can be disabled for faster initial page loads

### Browser Compatibility

Works in all modern browsers supporting the Web Audio API:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Memory Management

- Automatic cleanup on component unmount
- Proper event listener removal
- Timer cleanup to prevent memory leaks
- Single audio instance management

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📞 Support

For questions or issues, please open an issue on GitHub.