
import React, { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import type { StudyPack as StudyPackType } from '../types';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const DifficultyChip: React.FC<{ difficulty: 'Easy' | 'Medium' | 'Hard' }> = ({ difficulty }) => {
    const colorMap = {
        Easy: 'bg-green-100 text-green-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Hard: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[difficulty]}`}>
            {difficulty}
        </span>
    );
};

const StudyPackPage: React.FC = () => {
  const { api } = useApiClient();
  const [pack, setPack] = useState<StudyPackType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPack = async () => {
      try {
        setLoading(true);
        const data = await api.getCurrentPack();
        setPack(data);
      } catch (error) {
        console.error("Failed to fetch study pack:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Study Pack" subtitle="Preparing for Saturday's session." />
        <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
            <Card><div className="h-40 bg-gray-300 rounded"></div></Card>
            <Card><div className="h-40 bg-gray-300 rounded"></div></Card>
            <Card><div className="h-40 bg-gray-300 rounded"></div></Card>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div>
        <PageHeader title="Study Pack" subtitle="Preparing for Saturday's session." />
        <EmptyState
          title="Study Pack Not Generated Yet"
          message="The study pack for this week's topic is being created by our agents. It will be available shortly after the poll closes."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Study Pack: ${pack.topic}`} subtitle={`Curated resources for week ${pack.weekTag}.`} />

      {pack.assetUrl && (
          <div className="text-center mb-8">
              <a href={pack.assetUrl} download>
                  <Button variant="secondary">Download as PDF</Button>
              </a>
          </div>
      )}

      <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Overview</h2>
            <p className="text-brand-navy/80 leading-relaxed">{pack.overview}</p>
        </Card>

        <Card>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Recommended Resources</h2>
            <div className="space-y-4">
                {pack.recommendedResources.map((res, i) => (
                    <div key={i} className="p-3 bg-brand-ivory/50 rounded-md">
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-gold hover:underline">{res.title}</a>
                        <p className="text-sm text-brand-navy/70 italic">"{res.why}"</p>
                    </div>
                ))}
            </div>
        </Card>
        
        <Card>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Practice Problems</h2>
            <ul className="space-y-3">
                {pack.practiceProblems.map((prob, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-brand-ivory/50 rounded-md">
                        <a href={prob.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-navy hover:text-brand-gold">{prob.title}</a>
                        <DifficultyChip difficulty={prob.difficulty} />
                    </li>
                ))}
            </ul>
        </Card>
      </div>

      {pack.rerankedBy && (
          <p className="text-center mt-8 text-sm text-brand-navy/50 italic">(Optional) Reranked by {pack.rerankedBy}</p>
      )}
    </div>
  );
};

export default StudyPackPage;
