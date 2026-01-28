import { useEffect, useRef } from "react";

// Create a simple beep sound using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create two beeps for attention
    const playBeep = (startTime: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    };
    
    const now = audioContext.currentTime;
    playBeep(now, 880); // A5
    playBeep(now + 0.35, 1046.5); // C6
    playBeep(now + 0.7, 1318.5); // E6
  } catch (error) {
    console.log("Audio notification not supported:", error);
  }
}

export function useKitchenNotification(ordersCount: number) {
  const previousCount = useRef(ordersCount);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount to avoid playing on page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousCount.current = ordersCount;
      return;
    }

    // Play sound when new orders arrive (count increased)
    if (ordersCount > previousCount.current) {
      playNotificationSound();
    }

    previousCount.current = ordersCount;
  }, [ordersCount]);
}
