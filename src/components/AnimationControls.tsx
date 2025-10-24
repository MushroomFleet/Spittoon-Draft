/**
 * AnimationControls - Settings for animation behavior
 */

import React from 'react';

export const AnimationControls: React.FC = () => {
  const [animationSpeed, setAnimationSpeed] = React.useState(1);
  const [waveWidth, setWaveWidth] = React.useState(5);
  const [animationEnabled, setAnimationEnabled] = React.useState(true);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-semibold text-gray-800">Animation Settings</h3>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">Enable Animations</label>
        <input
          type="checkbox"
          checked={animationEnabled}
          onChange={(e) => setAnimationEnabled(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      </div>

      {/* Speed Control */}
      <div>
        <label className="text-sm text-gray-700 block mb-1">
          Animation Speed: {animationSpeed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          className="w-full"
          disabled={!animationEnabled}
        />
      </div>

      {/* Wave Width */}
      <div>
        <label className="text-sm text-gray-700 block mb-1">
          Wave Width: {waveWidth} characters
        </label>
        <input
          type="range"
          min="3"
          max="10"
          step="1"
          value={waveWidth}
          onChange={(e) => setWaveWidth(parseInt(e.target.value))}
          className="w-full"
          disabled={!animationEnabled}
        />
      </div>
    </div>
  );
};
