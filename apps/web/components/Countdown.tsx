
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownProps {
  targetDate: string;
}

const CountdownDisplayItem = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl lg:text-5xl font-bold text-brand-navy tracking-tighter">{String(value).padStart(2, '0')}</span>
    <span className="text-xs uppercase text-brand-navy/70 tracking-widest">{label}</span>
  </div>
);

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const { days, hours, minutes, seconds, isFinished } = useCountdown(targetDate);

  if (isFinished) {
    return <div className="text-center text-2xl font-bold text-brand-gold">The time has come!</div>;
  }

  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-8" title={`Target: ${new Date(targetDate).toISOString()}`}>
      <CountdownDisplayItem value={days} label="Days" />
      <span className="text-4xl font-light text-brand-navy/50">:</span>
      <CountdownDisplayItem value={hours} label="Hours" />
      <span className="text-4xl font-light text-brand-navy/50">:</span>
      <CountdownDisplayItem value={minutes} label="Minutes" />
      <span className="text-4xl font-light text-brand-navy/50">:</span>
      <CountdownDisplayItem value={seconds} label="Seconds" />
    </div>
  );
};
