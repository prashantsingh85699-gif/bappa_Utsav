import React from 'react';
import { UtsavStage } from '../stage/UtsavStage';

interface FestivalBackgroundProps {
  reducedMotion?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const FestivalBackground: React.FC<FestivalBackgroundProps> = ({
  reducedMotion = false,
  intensity = 'high',
}) => {
  return (
    <UtsavStage
      intensity={intensity}
      reducedMotion={reducedMotion}
    />
  );
};

export default FestivalBackground;
