
import React, { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import type { WeeklyDigest } from '../types';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';

const RecapSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <Card>
    <h2 className="text-2xl font-bold text-brand-navy border-b-2 border-brand-gold pb-2 mb-4">{title}</h2>
    <ul className="list-disc list-inside space-y-2 text-brand-navy/90">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </Card>
);

const RecapPage: React.FC = () => {
  const { api } = useApiClient();
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        setLoading(true);
        const data = await api.getCurrentDigest();
        setDigest(data);
      } catch (error) {
        console.error("Failed to fetch weekly digest:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDigest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Weekly Recap" subtitle="A summary of our last session." />
        <div className="space-y-8 max-w-4xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-5 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-5 bg-gray-300 rounded w-5/6 mb-2"></div>
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div>
        <PageHeader title="Weekly Recap" subtitle="A summary of our last session." />
        <EmptyState
          title="Recap Not Available Yet"
          message="The summary for the last session hasn't been published. It's usually available by Monday."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Recap: ${digest.topic}`} subtitle={`A summary of our discussion for week ${digest.weekTag}.`} />
      
      <div className="space-y-8 max-w-4xl mx-auto">
        <RecapSection title="Key Takeaways" items={digest.keyTakeaways} />
        <RecapSection title="Common Pitfalls" items={digest.commonPitfalls} />
        <RecapSection title="Next Steps" items={digest.nextSteps} />
      </div>

      <div className="text-center mt-12">
        <Link to="/propose" className="text-lg text-brand-gold hover:underline font-semibold">
          Ready for next week? Suggest a new topic &rarr;
        </Link>
      </div>
    </div>
  );
};

export default RecapPage;
