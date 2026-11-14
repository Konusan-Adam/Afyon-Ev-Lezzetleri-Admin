import React from 'react';
import { YonetimRaporlar } from './YonetimRaporlar';
import { YonetimOzeti } from './YonetimOzeti';

export const YonetimOzetBirlesik: React.FC = () => (
  <div className="space-y-6">
    <YonetimRaporlar />
    <YonetimOzeti />
  </div>
);
