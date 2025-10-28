
import React, { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import type { SessionInfo } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { generateICS, downloadICS } from '../utils/ics';
import { Link } from 'react-router-dom';

const SessionPage: React.FC = () => {
  const { api } = useApiClient();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleAddToCalendar = () => {
    if (sessionInfo && sessionInfo.topic) {
      const icsContent = generateICS(
        `DevLoop: ${sessionInfo.topic}`,
        `Weekly DSA session on ${sessionInfo.topic}. Join us!`,
        new Date(sessionInfo.startsAt),
        sessionInfo.meetingUrl || sessionInfo.locationLabel
      );
      downloadICS(icsContent, `devloop-session-${sessionInfo.weekTag}.ics`);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="This Week's Session" subtitle="Details for our upcoming Saturday meeting." />
        <Card className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-2/3 mb-6"></div>
            <div className="flex gap-4">
                <div className="h-12 bg-gray-300 rounded w-40"></div>
                <div className="h-12 bg-gray-300 rounded w-40"></div>
            </div>
        </Card>
      </div>
    );
  }
  
  if (!sessionInfo?.topic) {
     return (
       <div>
         <PageHeader title="This Week's Session" subtitle="The winning topic will be revealed soon." />
         <EmptyState
           title="Topic Not Decided Yet"
           message="The weekly poll is still open or the results are being tallied. Check back after the poll closes on Saturday at noon."
         />
          <div className="text-center mt-8">
              <Link to="/poll">
                  <Button variant="secondary">Go to Poll</Button>
              </Link>
          </div>
       </div>
     );
  }

  return (
    <div>
      <PageHeader title="This Week's Session" subtitle={`Get ready to dive deep into: ${sessionInfo.topic}`} />

      <Card className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-lg text-brand-navy/70">Topic for {sessionInfo.weekTag}</p>
          <h2 className="text-4xl font-extrabold text-brand-navy my-2">{sessionInfo.topic}</h2>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
          <div className="bg-brand-ivory/50 p-4 rounded-lg">
            <h3 className="font-bold text-brand-navy">When</h3>
            <p>{new Date(sessionInfo.startsAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
          <div className="bg-brand-ivory/50 p-4 rounded-lg">
            <h3 className="font-bold text-brand-navy">Where</h3>
            <p>
              {sessionInfo.meetingUrl ? (
                <a href={sessionInfo.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  {sessionInfo.locationLabel}
                </a>
              ) : (
                sessionInfo.locationLabel
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-navy/10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleAddToCalendar} variant="primary">
            Add to Calendar
          </Button>
          <Button variant="outline" disabled>
            RSVP (Coming Soon)
          </Button>
        </div>
      </Card>
      
      <div className="text-center mt-12">
        <Link to="/pack" className="text-lg text-brand-gold hover:underline font-semibold">
          Check out the Study Pack to prepare &rarr;
        </Link>
      </div>
    </div>
  );
};

export default SessionPage;
