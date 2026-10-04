import React from 'react';
import { JourneyStage, DerivedPregnancyMetrics } from '../../types/domain';
import { PregnancyHero } from './PregnancyHero';

interface JourneyHeroProps {
  stage: JourneyStage;
  pregnancyMetrics: DerivedPregnancyMetrics;
  demoDueDate: string;
  isDemo?: boolean;
}

/**
 * Architectural Seam for Lifecycle Stage Heroes
 * Currently serves the approved PregnancyHero for the Pregnancy MVP.
 * Future stages (Newborn, Infant, Toddler, Preschool) can cleanly plug in here.
 */
export const JourneyHero: React.FC<JourneyHeroProps> = ({
  stage,
  pregnancyMetrics,
  demoDueDate,
  isDemo = true,
}) => {
  switch (stage) {
    case 'pregnancy':
    default:
      return (
        <PregnancyHero
          demoDueDate={demoDueDate}
          isDemo={isDemo}
          currentWeek={pregnancyMetrics.currentWeek}
          trimester={pregnancyMetrics.trimester}
          daysRemaining={pregnancyMetrics.daysRemaining}
          progressPercent={pregnancyMetrics.progressPercent}
        />
      );
  }
};
