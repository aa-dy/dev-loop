
import React, { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import type { Poll as PollType, CuratedTopic } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Countdown } from '../components/Countdown';
import { Link } from 'react-router-dom';

const PollPage: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({ addToast }) => {
  const { api } = useApiClient();
  const [poll, setPoll] = useState<PollType | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedTopic, setVotedTopic] = useState<string | null>(() => localStorage.getItem('votedTopic'));
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('userEmail') || '');
  const [emailError, setEmailError] = useState('');
  
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const currentPoll = await api.getCurrentPoll();
        setPoll(currentPoll);
        if (localStorage.getItem(`votedPoll_${currentPoll.id}`)) {
          setVotedTopic(localStorage.getItem('votedTopic'));
        } else {
          localStorage.removeItem('votedTopic');
          setVotedTopic(null);
        }
      } catch (error) {
        console.error("Failed to fetch poll:", error);
        addToast('Failed to load the poll. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = async (topic: string) => {
    if (!userEmail) {
      setEmailError('Please enter your email to vote.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    localStorage.setItem('userEmail', userEmail);
    
    if (poll) {
        const result = await api.vote(poll.id, { email: userEmail, topic });
        if (result.ok) {
            setVotedTopic(topic);
            localStorage.setItem(`votedPoll_${poll.id}`, 'true');
            localStorage.setItem('votedTopic', topic);
            addToast(`Successfully voted for "${topic}"!`, 'success');
        } else {
            addToast('You have already voted this week.', 'error');
             setVotedTopic(topic); // Assume they already voted for this
             localStorage.setItem(`votedPoll_${poll.id}`, 'true');
             localStorage.setItem('votedTopic', topic);
        }
    }
  };
  
  if (loading) {
    return (
        <div>
            <PageHeader title="Weekly Poll" subtitle="Cast your vote for this Saturday's topic."/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                        <div className="h-10 bg-gray-300 rounded w-28"></div>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  if (!poll || poll.topics.length === 0) {
      return (
          <div>
              <PageHeader title="Weekly Poll" subtitle="Submissions are being curated."/>
              <EmptyState
                  title="Poll Not Ready Yet"
                  message="Topic submissions are being reviewed. The poll will open soon. Check back later!"
              />
          </div>
      );
  }

  if (poll.status === 'not_open') {
    return (
      <div>
        <PageHeader title="Poll Opens Soon" subtitle="Get ready to cast your vote for this week's topic." />
        <div className="max-w-2xl mx-auto">
            <Countdown targetDate={poll.openAt} />
        </div>
      </div>
    );
  }

  if (poll.status === 'closed') {
    const winner = [...poll.topics].sort((a,b) => b.supportCount - a.supportCount)[0];
    return (
      <div>
        <PageHeader title="Poll Closed" subtitle="The results are in!"/>
        <Card className="text-center max-w-2xl mx-auto">
            <h2 className="text-lg text-brand-navy/80">This week's winning topic is:</h2>
            <p className="text-4xl font-extrabold text-brand-gold my-4">{winner?.canonicalTitle || 'To be announced'}</p>
            <p className="mb-6">{winner?.rationale}</p>
            <Link to="/session">
                <Button>View Session Details</Button>
            </Link>
        </Card>
      </div>
    );
  }

  // Poll is open
  return (
    <div>
      <PageHeader title="Weekly Poll" subtitle="Cast your vote for this Saturday's topic." />
      <div className="text-center mb-8">
        <h3 className="font-bold text-brand-navy">Poll closes in:</h3>
        <Countdown targetDate={poll.closeAt} />
      </div>

      {!votedTopic && (
          <div className="max-w-md mx-auto mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your Email (required to vote)</label>
              <input type="email" name="email" id="email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                  placeholder="you@example.com"
              />
              {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {poll.topics.map((topic) => (
          <Card key={topic.canonicalTitle} className={`flex flex-col justify-between transition-all ${votedTopic === topic.canonicalTitle ? 'ring-4 ring-brand-gold' : ''}`}>
            <div>
              <h3 className="text-xl font-bold text-brand-navy">{topic.canonicalTitle}</h3>
              <p className="text-brand-navy/70 mt-2 mb-4">{topic.rationale}</p>
            </div>
            <Button 
                onClick={() => handleVote(topic.canonicalTitle)} 
                disabled={!!votedTopic}
                variant={votedTopic === topic.canonicalTitle ? 'secondary' : 'primary'}>
              {votedTopic === topic.canonicalTitle ? 'Voted!' : 'Vote for this topic'}
            </Button>
          </Card>
        ))}
      </div>
       {votedTopic && <p className="text-center mt-8 text-lg font-semibold text-brand-navy">Thanks for voting!</p>}
    </div>
  );
};

export default PollPage;
