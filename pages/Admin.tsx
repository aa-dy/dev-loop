
import React from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const AdminPage: React.FC = () => {
  const { api, adapterType, setAdapterType } = useApiClient();

  const handleAdapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdapterType(e.target.checked ? 'http' : 'mock');
  };
  
  const handleCurate = () => {
    api.mock_curateTopics?.();
    alert('Mock state: Submissions closed, new poll topics generated. Poll is now "not_open".');
  };

  const handleCycleState = () => {
    api.mock_cycleState?.();
    alert('Mock state advanced. Check the /poll page.');
  };
  
  const handleGeneratePack = () => {
    api.mock_generatePack?.();
    alert('Mock state: Study pack generated. Check the /pack page.');
  };
  
  const handlePublishRecap = () => {
    api.mock_publishRecap?.();
    alert('Mock state: Weekly recap published. Check the /recap page.');
  };

  return (
    <div>
      <PageHeader title="Admin Panel" subtitle="Developer controls for testing and demonstration." />
      
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">API Adapter</h2>
          <div className="flex items-center space-x-4 bg-brand-ivory/50 p-4 rounded-md">
            <span className={adapterType === 'mock' ? 'font-bold text-brand-navy' : 'text-gray-500'}>Mock</span>
            <label htmlFor="adapter-toggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="adapter-toggle"
                className="sr-only peer"
                checked={adapterType === 'http'}
                onChange={handleAdapterChange}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-navy"></div>
            </label>
            <span className={adapterType === 'http' ? 'font-bold text-brand-navy' : 'text-gray-500'}>HTTP</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Current adapter: <span className="font-semibold">{adapterType}</span>. Switching will reload the app.
          </p>
        </Card>

        {adapterType === 'mock' && (
          <Card>
            <h2 className="text-xl font-bold mb-4">Simulate Weekly Cycle (Mock Only)</h2>
            <p className="mb-4 text-sm text-gray-600">Use these buttons to move the mock data through its weekly lifecycle.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={handleCurate}>Close Submissions &rarr; Curate Topics</Button>
              <Button onClick={handleCycleState}>Open / Close Poll</Button>
              <Button onClick={handleGeneratePack}>Generate Study Pack</Button>
              <Button onClick={handlePublishRecap}>Publish Recap</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
