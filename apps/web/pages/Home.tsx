
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, SCHEDULE } from '../constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Countdown } from '../components/Countdown';
import { useApiClient } from '../hooks/useApiClient';
import { getNextOccurrence } from '../utils/date';
import type { SessionInfo } from '../types';

const HomePage: React.FC = () => {
  const { api } = useApiClient();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const nextSessionDate = getNextOccurrence(SCHEDULE.SESSION_START.day, SCHEDULE.SESSION_START.hour, SCHEDULE.SESSION_START.minute);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const info = await api.getSessionInfo();
        setSessionInfo(info);
      } catch (error) {
        console.error("Failed to fetch session info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl md:text-7xl font-extrabold text-brand-navy tracking-tighter">
          {BRAND.NAME}
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-brand-navy/80 max-w-3xl mx-auto">
          {BRAND.TAGLINE}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/propose">
            <Button variant="primary" className="w-full sm:w-auto">Suggest a Topic</Button>
          </Link>
          <Link to="/poll">
            <Button variant="secondary" className="w-full sm:w-auto">Vote Now</Button>
          </Link>
          <Link to="/session">
            <Button variant="outline" className="w-full sm:w-auto">This Week's Session</Button>
          </Link>
        </div>
      </div>

      {/* Countdown Section */}
      <div>
        <h2 className="text-center text-3xl font-bold text-brand-navy mb-4">
          Next Session Starts In
        </h2>
        <Countdown targetDate={nextSessionDate.toISOString()} />
      </div>

      {/* At a Glance Section */}
      <Card className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-brand-navy mb-4">This Week at a Glance</h2>
        {loading ? (
          <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 animate-pulse"></div>
          </div>
        ) : sessionInfo ? (
          <div className="space-y-3 text-lg">
            <p>
              <span className="font-bold">Leading Topic:</span> {sessionInfo.topic || 'To be decided by poll'}
            </p>
            <p>
              <span className="font-bold">When:</span> {new Date(sessionInfo.startsAt).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: 'numeric' })}
            </p>
            <p>
              <span className="font-bold">Where:</span>{' '}
              <a href={sessionInfo.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                {sessionInfo.locationLabel}
              </a>
            </p>
          </div>
        ) : (
             <p className="text-brand-navy/70">Could not load session details. Please try again later.</p>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
