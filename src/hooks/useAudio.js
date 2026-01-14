import { useState, useRef, useEffect, useCallback } from 'react';

// Free ambient audio URLs (royalty-free)
export const AMBIENT_TRACKS = [
  {
    id: 'rain',
    name: 'Rain Sounds',
    url: 'https://www.soundjay.com/nature/rain-01.mp3'
  },
  {
    id: 'forest',
    name: 'Forest Ambience',
    url: 'https://www.soundjay.com/nature/forest-1.mp3'
  },
  {
    id: 'none',
    name: 'No Music',
    url: null
  }
];

export function useAudio() {
  const [currentTrack, setCurrentTrack] = useState(AMBIENT_TRACKS[2]); // Start with no music
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle track change
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentTrack.url) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const play = useCallback(() => {
    if (audioRef.current && currentTrack.url) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const selectTrack = useCallback((track) => {
    setCurrentTrack(track);
    if (track.url && isPlaying) {
      // Will auto-play due to useEffect
    }
  }, [isPlaying]);

  return {
    currentTrack,
    volume,
    setVolume,
    isPlaying,
    play,
    pause,
    togglePlay,
    selectTrack,
    tracks: AMBIENT_TRACKS
  };
}
