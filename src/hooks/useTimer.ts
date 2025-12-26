import { useState, useEffect, useRef, useCallback } from 'react';
import { UseTimerProps } from '../types';

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;

export const useTimer = ({ onSessionComplete, onSequenceComplete }: UseTimerProps = {}) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const totalDuration = mode === 'work' ? POMODORO_TIME : SHORT_BREAK;

  const startTimer = useCallback(() => {
    setIsActive(true);
    endTimeRef.current = Date.now() + timeLeft * 1000;
  }, [timeLeft]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    endTimeRef.current = null;
  }, []);

  const toggleTimer = useCallback(() => {
    if (isActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isActive, pauseTimer, startTimer]);

  const resetTimer = useCallback(
    (autoStart = false) => {
      pauseTimer();
      setMode('work');
      setTimeLeft(POMODORO_TIME);

      if (autoStart) {
        setIsActive(true);
        endTimeRef.current = Date.now() + POMODORO_TIME * 1000;
      }
    },
    [pauseTimer]
  );

  useEffect(() => {
    if (!isActive || !endTimeRef.current) return;

    const loop = () => {
      const now = Date.now();
      const remainingResult = Math.ceil((endTimeRef.current! - now) / 1000);
      const remaining = Math.max(0, remainingResult);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (mode === 'work') {
          setMode('break');
          const nextTime = SHORT_BREAK;
          setTimeLeft(nextTime);
          endTimeRef.current = now + nextTime * 1000;

          if (onSessionComplete) onSessionComplete(25);
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        } else {
          pauseTimer();
          setTimeLeft(0);

          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
          if (onSequenceComplete) onSequenceComplete();
        }
      } else {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, mode, onSessionComplete, onSequenceComplete, pauseTimer]);

  return {
    timeLeft,
    isActive,
    mode,
    toggleTimer,
    resetTimer,
    totalDuration,
    startTimer,
    pauseTimer,
  };
};
