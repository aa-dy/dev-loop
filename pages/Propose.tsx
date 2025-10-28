
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { Button } from '../components/Button';
import { useApiClient } from '../hooks/useApiClient';
import type { WeekTag } from '../types';

interface IFormInput {
  email: string;
  topic: string;
  notes?: string;
}

const ProposePage: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({ addToast }) => {
  const { api } = useApiClient();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<IFormInput>();
  const [submittedWeekTag, setSubmittedWeekTag] = useState<WeekTag | null>(null);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      const response = await api.submitProposal(data);
      if (response.ok) {
        addToast('Your topic has been submitted successfully!', 'success');
        setSubmittedWeekTag(response.weekTag);
        reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      addToast('There was an error submitting your topic. Please try again.', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Suggest a Topic" subtitle="Have a DSA concept you want to tackle? Propose it for an upcoming session!" />
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', { 
                required: 'Email is required', 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <Input
              id="topic"
              label="DSA Topic / Question"
              placeholder="e.g., KMP Algorithm"
              error={errors.topic?.message}
              {...register('topic', { 
                required: 'Topic is required',
                minLength: { value: 3, message: 'Topic must be at least 3 characters long' }
              })}
            />
            <p className="text-sm text-brand-navy/60 -mt-4">Examples: Binary Search on Answers, BFS vs DFS, DP on Trees</p>

            <TextArea
              id="notes"
              label="Notes (Optional)"
              placeholder="Any specific questions, resources, or context you want to add?"
              {...register('notes')}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </form>
        </Card>

        {submittedWeekTag && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-md text-center" role="alert">
            <p className="font-bold">Thanks for your submission!</p>
            <p>Your topic is in the running for week <span className="font-mono bg-green-200 px-1 rounded">{submittedWeekTag}</span>.</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-brand-navy/5 border border-brand-navy/10 rounded-lg text-center text-brand-navy/80">
          <h3 className="font-bold">Timeline</h3>
          <p>Submissions close every Wednesday at 6 PM.</p>
          <p>Voting runs from Thursday morning to Saturday noon.</p>
        </div>
      </div>
    </div>
  );
};

export default ProposePage;
