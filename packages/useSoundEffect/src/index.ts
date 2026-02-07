"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';

/**
 * Configuration options for the useSoundEffect hook.
 */
interface SoundEffectOptions {
  /** 
   * Initial volume level between 0 (mute) and 1 (full volume).
   * @default 1
   */
  volume?: number;
  
  /** 
   * Whether to preload the audio file on mount for faster playback.
   * @default true
   */
  preload?: boolean;
  
  /** 
   * Whether the sound should loop continuously when played.
   * @default false
   */
  loop?: boolean;
  
  /** 
   * Whether to automatically play the sound at random intervals.
   * @default false
   */
  playRandomly?: boolean;
  
  /** 
   * Minimum delay between random plays in milliseconds (used when playRandomly is true).
   * @default 5000
   */
  minInterval?: number;
  
  /** 
   * Maximum delay between random plays in milliseconds (used when playRandomly is true).
   * @default 15000
   */
  maxInterval?: number;
  
  /** 
   * Whether to automatically play the sound when the component mounts.
   * @default false
   */
  autoplay?: boolean;
  
  /** 
   * Start playback from this timestamp in seconds (audio cropping).
   * Useful for playing specific portions of longer audio files.
   * @default 0
   * @example
   * // Start playing from 10 seconds into the track
   * startFrom: 10
   */
  startFrom?: number;
  
  /** 
   * Stop playback at this timestamp in seconds (audio cropping).
   * When combined with startFrom, creates a cropped audio segment.
   * @default undefined (plays to the end)
   * @example
   * // Play only seconds 10-30 of the audio
   * startFrom: 10,
   * stopAt: 30
   */
  stopAt?: number;
  
  /** 
   * Fade in duration in seconds at the start of playback.
   * Creates a smooth volume transition from 0 to the target volume.
   * Uses 50 interpolation steps for smooth transitions.
   * @default 0
   * @example
   * // Fade in over 2 seconds
   * transitionStart: 2
   */
  transitionStart?: number;
  
  /** 
   * Fade out duration in seconds at the end of playback.
   * When used with stopAt, the fade begins at (stopAt - transitionEnd).
   * Creates a smooth volume transition from target volume to 0.
   * @default 0
   * @example
   * // Fade out over 3 seconds before stopping
   * stopAt: 30,
   * transitionEnd: 3  // Fade starts at 27 seconds
   */
  transitionEnd?: number;
}

/**
 * Return value interface for the useSoundEffect hook.
 * All functions are stable and safe to use as dependencies in useEffect.
 */
interface SoundEffectReturn {
  /**
   * Play the sound effect.
   * Stops any currently playing instance and starts fresh playback.
   * Applies all configured options including cropping and transitions.
   * 
   * @example
   * const sound = useSoundEffect('/click.mp3');
   * <button onClick={sound.play}>Play</button>
   */
  play: () => void;
  
  /**
   * Stop the currently playing sound effect.
   * Immediately halts playback and resets the audio position.
   * Also clears any active fade transitions.
   * 
   * @example
   * const sound = useSoundEffect('/music.mp3', { loop: true });
   * <button onClick={sound.stop}>Stop</button>
   */
  stop: () => void;
  
  /**
   * Start random playback at intervals between minInterval and maxInterval.
   * Only works if playRandomly option was initially set to true.
   * Each play will respect all configured options including transitions.
   * 
   * @example
   * const sound = useSoundEffect('/chime.mp3', { 
   *   playRandomly: true,
   *   minInterval: 5000,
   *   maxInterval: 15000 
   * });
   * <button onClick={sound.startRandom}>Start Random</button>
   */
  startRandom: () => void;
  
  /**
   * Stop the random playback schedule.
   * Does not stop any currently playing sound, only prevents future random plays.
   * Can be resumed by calling startRandom() again.
   * 
   * @example
   * const sound = useSoundEffect('/ambient.mp3', { playRandomly: true });
   * <button onClick={sound.stopRandom}>Stop Random</button>
   */
  stopRandom: () => void;
  
  /**
   * Adjust the volume of the sound effect.
   * Affects both currently playing audio and future playback.
   * The volume is automatically clamped between 0 and 1.
   * 
   * @param newVolume - The desired volume level (0 to 1)
   * @returns The actual volume that was set after clamping
   * 
   * @example
   * const sound = useSoundEffect('/music.mp3');
   * 
   * // Set volume to 50%
   * sound.adjustVolume(0.5);
   * 
   * // With slider
   * <input 
   *   type="range" 
   *   min="0" 
   *   max="1" 
   *   step="0.1"
   *   value={sound.currentVolume}
   *   onChange={(e) => sound.adjustVolume(parseFloat(e.target.value))}
   * />
   */
  adjustVolume: (newVolume: number) => number;
  
  /**
   * Whether the sound is currently playing.
   * Updates in real-time as playback starts and stops.
   * 
   * @example
   * const sound = useSoundEffect('/effect.mp3');
   * <p>Status: {sound.isPlaying ? 'Playing' : 'Stopped'}</p>
   */
  isPlaying: boolean;
  
  /**
   * Current volume level between 0 and 1.
   * Updates when adjustVolume() is called.
   * 
   * @example
   * const sound = useSoundEffect('/sound.mp3');
   * <p>Volume: {(sound.currentVolume * 100).toFixed(0)}%</p>
   */
  currentVolume: number;
}

/**
 * React hook for playing sound effects with advanced features including audio cropping,
 * volume transitions, random playback, and more.
 * 
 * All returned functions and values are stable and safe to use as dependencies in useEffect
 * without causing infinite loops or unnecessary re-renders.
 *
 * @param soundUrl - URL or path to the sound file to play
 * @param options - Optional configuration object for playback behavior
 * 
 * @returns Stable object containing playback controls and current state
 * 
 * @example
 * // Basic usage
 * const sound = useSoundEffect('/click.mp3', { volume: 0.5 });
 * <button onClick={sound.play}>Click Me</button>
 * 
 * @example
 * // Audio cropping with fade transitions
 * const intro = useSoundEffect('/song.mp3', {
 *   startFrom: 10,        // Start at 10 seconds
 *   stopAt: 30,           // Stop at 30 seconds
 *   transitionStart: 2,   // 2 second fade in
 *   transitionEnd: 2,     // 2 second fade out
 * });
 * 
 * @example
 * // Background music with autoplay and loop
 * const bgMusic = useSoundEffect('/ambient.mp3', {
 *   volume: 0.3,
 *   loop: true,
 *   autoplay: true,
 *   transitionStart: 4,   // Smooth 4 second fade in
 * });
 * 
 * @example
 * // Random playback with transitions
 * const chime = useSoundEffect('/chime.mp3', {
 *   playRandomly: true,
 *   minInterval: 5000,
 *   maxInterval: 15000,
 *   transitionStart: 0.5,
 *   transitionEnd: 0.5,
 * });
 * 
 * @example
 * // Safe to use as dependency
 * const sound = useSoundEffect('/notify.mp3');
 * useEffect(() => {
 *   if (someCondition) {
 *     sound.play(); // ✅ No infinite loop - sound object is stable
 *   }
 * }, [someCondition, sound]);
 */
const useSoundEffect = (
  soundUrl: string,
  options: SoundEffectOptions = {}
): SoundEffectReturn => {
  const {
    volume: initialVolume = 1,
    preload = true,
    loop = false,
    playRandomly = false,
    minInterval = 5000,
    maxInterval = 15000,
    autoplay = false,
    startFrom = 0,
    stopAt,
    transitionStart = 0,
    transitionEnd = 0,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVolume, setCurrentVolume] = useState<number>(initialVolume);

  /**
   * Cleanup function that safely stops audio playback and clears all timers.
   * Called on unmount and before starting new playback.
   * 
   * @internal
   */
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /**
   * Stop the currently playing sound effect.
   * This is a wrapper around cleanup() that provides a semantic API.
   * 
   * @internal
   */
  const stopSoundEffect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  /**
   * Apply a gradual volume fade effect to an audio element.
   * Uses 50 interpolation steps for smooth transitions.
   * 
   * @param audio - The HTMLAudioElement to apply the fade to
   * @param targetVolume - The desired final volume (0 to 1)
   * @param duration - The fade duration in seconds
   * @param onComplete - Optional callback to execute when fade completes
   * 
   * @internal
   */
  const applyFade = useCallback(
    (audio: HTMLAudioElement, targetVolume: number, duration: number, onComplete?: () => void) => {
      if (duration <= 0) {
        audio.volume = targetVolume;
        onComplete?.();
        return;
      }

      const startVolume = audio.volume;
      const volumeDelta = targetVolume - startVolume;
      const steps = 50; // Number of volume adjustments
      const stepDuration = (duration * 1000) / steps;
      const volumeStep = volumeDelta / steps;

      let currentStep = 0;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          audio.volume = targetVolume;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          onComplete?.();
        } else {
          audio.volume = Math.min(1, Math.max(0, startVolume + volumeStep * currentStep));
        }
      }, stepDuration);
    },
    []
  );

  /**
   * Play the sound effect with all configured options.
   * Handles audio creation, cropping, transitions, and event listeners.
   * 
   * Process:
   * 1. Cleans up any existing audio
   * 2. Creates new Audio element with configured start position
   * 3. Sets up time tracking for stopAt and fade out
   * 4. Applies fade in if transitionStart is set
   * 5. Starts playback
   * 
   * @internal
   */
  const playSoundEffect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clean up any previous audio
    cleanup();

    try {
      const audio = new Audio(soundUrl);
      audioRef.current = audio;

      // Set initial properties
      audio.currentTime = startFrom;
      audio.loop = loop;

      // Set initial volume (0 if fade in, otherwise target volume)
      const targetVolume = Math.min(1, Math.max(0, currentVolume));
      audio.volume = transitionStart > 0 ? 0 : targetVolume;

      // Update playing status
      setIsPlaying(true);

      /**
       * Handle timeupdate events to implement stopAt and fade out functionality.
       * Monitors playback position and triggers fade out or stop when needed.
       * 
       * @internal
       */
      const handleTimeUpdate = () => {
        if (!stopAt) return;

        const currentTime = audio.currentTime;
        const shouldFadeOut = transitionEnd > 0 && currentTime >= stopAt - transitionEnd;
        const shouldStop = currentTime >= stopAt;

        if (shouldStop) {
          audio.pause();
          cleanup();
        } else if (shouldFadeOut && !fadeIntervalRef.current) {
          applyFade(audio, 0, transitionEnd, () => {
            audio.pause();
            cleanup();
          });
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);

      // Handle playback end
      audio.addEventListener('ended', () => {
        if (audioRef.current === audio && !loop) {
          cleanup();
        }
      });

      // Handle errors
      audio.addEventListener('error', (error) => {
        console.error('Error playing sound effect:', error);
        cleanup();
      });

      // Play the sound
      audio.play().catch((error) => {
        console.error('Error playing sound effect:', error);
        cleanup();
      });

      // Apply fade in if specified
      if (transitionStart > 0) {
        applyFade(audio, targetVolume, transitionStart);
      }
    } catch (error) {
      console.error('Error creating audio element:', error);
      cleanup();
    }
  }, [soundUrl, currentVolume, loop, startFrom, stopAt, transitionStart, transitionEnd, cleanup, applyFade]);

  /**
   * Start random playback scheduling.
   * Plays the sound at random intervals between minInterval and maxInterval.
   * Each playback respects all configured options including transitions.
   * 
   * Uses recursive setTimeout (not setInterval) for more reliable scheduling
   * and to prevent overlapping plays.
   * 
   * @internal
   */
  const startRandomPlayback = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    /**
     * Recursively schedule the next random playback.
     * Calculates a random delay and schedules the next play.
     * 
     * @internal
     */
    const scheduleNextPlay = () => {
      const randomDelay = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
      intervalRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          playSoundEffect();
          scheduleNextPlay();
        }
      }, randomDelay);
    };

    scheduleNextPlay();
  }, [minInterval, maxInterval, playSoundEffect]);

  /**
   * Stop the random playback scheduling.
   * Clears any pending scheduled plays but does not stop currently playing audio.
   * 
   * @internal
   */
  const stopRandomPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Adjust the volume of the sound effect.
   * Updates both the current playback volume (if playing) and the volume for future playback.
   * The volume is automatically clamped between 0 and 1.
   * 
   * @param newVolume - The desired volume level (0 to 1)
   * @returns The actual volume that was set after clamping
   * 
   * @internal
   */
  const adjustVolume = useCallback((newVolume: number): number => {
    const clampedVolume = Math.min(1, Math.max(0, newVolume));
    setCurrentVolume(clampedVolume);

    // Update current audio volume if playing
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }

    return clampedVolume;
  }, []);

  /**
   * Effect: Handle audio preloading.
   * Creates and preloads audio element if preload option is enabled.
   * Only runs once on mount or when critical dependencies change.
   */
  useEffect(() => {
    if (preload && !audioRef.current) {
      const audio = new Audio(soundUrl);
      audio.volume = Math.min(1, Math.max(0, initialVolume));
      audio.preload = 'auto';
      audioRef.current = audio;
    }
  }, [soundUrl, preload, initialVolume]);

  /**
   * Effect: Handle autoplay functionality.
   * Automatically plays the sound when component mounts if autoplay is enabled.
   * Only triggers on mount or when autoplay setting changes.
   */
  useEffect(() => {
    if (autoplay) {
      playSoundEffect();
    }
  }, [autoplay]); // Only trigger on mount or autoplay change

  /**
   * Effect: Handle random playback scheduling.
   * Starts or stops random playback based on the playRandomly option.
   * Cleans up scheduling on unmount.
   */
  useEffect(() => {
    if (playRandomly) {
      startRandomPlayback();
    } else {
      stopRandomPlayback();
    }

    return () => {
      stopRandomPlayback();
    };
  }, [playRandomly, startRandomPlayback, stopRandomPlayback]);

  /**
   * Effect: Cleanup on unmount.
   * Ensures all audio and timers are properly cleaned up when component unmounts.
   * Sets mounted flag to false to prevent any async operations from executing.
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  /**
   * Return stable memoized object containing all controls and state.
   * This object reference only changes when the underlying values change,
   * making it safe to use as a dependency in useEffect without causing infinite loops.
   */
  return useMemo(
    () => ({
      play: playSoundEffect,
      stop: stopSoundEffect,
      startRandom: startRandomPlayback,
      stopRandom: stopRandomPlayback,
      adjustVolume,
      isPlaying,
      currentVolume,
    }),
    [playSoundEffect, stopSoundEffect, startRandomPlayback, stopRandomPlayback, adjustVolume, isPlaying, currentVolume]
  );
};

export default useSoundEffect;