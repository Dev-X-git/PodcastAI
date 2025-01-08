import React from 'react';

// Define the props for the Timer component
interface TimerProps {
  scriptTimers: string[]; // Array of script timer strings
  scriptTotalTimer: number; // Total script timer in seconds
  audioTimers: string[]; // Array of audio timer strings
  audioTotalTimer: number; // Total audio timer in seconds
  currentIndex: number; // Current index for accessing timers
  formatDuration: (duration: number) => string; // Function to format duration
}

// Timer component to display script and audio timers
export const Timer: React.FC<TimerProps> = ({
  scriptTimers,
  scriptTotalTimer,
  audioTimers,
  audioTotalTimer,
  currentIndex,
  formatDuration,
}) => {
  return (
    <div className="absolute top-5 right-5 text-white">
      <p>
        Script Timer:{" "}
        {scriptTimers[currentIndex - 1] // Display current script timer or placeholder
          ? scriptTimers[currentIndex - 1]
          : "--:--"}
      </p>
      <p>
        Total Script Timer:{" "}
        {scriptTotalTimer // Display formatted total script timer or placeholder
          ? formatDuration(scriptTotalTimer)
          : "--:--"}
      </p>
      <p>
        Audio Timer:{" "}
        {audioTimers[currentIndex - 1] // Display current audio timer or placeholder
          ? audioTimers[currentIndex - 1]
          : "--:--"}
      </p>
      <p>
        Total Audio Timer:{" "}
        {audioTotalTimer // Display formatted total audio timer or placeholder
          ? formatDuration(audioTotalTimer)
          : "--:--"}
      </p>
    </div>
  );
};