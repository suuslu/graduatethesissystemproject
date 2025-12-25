import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type University = {
  id: number;
  universityName: string;
  location: string;
};

export default function UniversityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadUniversity = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/universities/${id}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setUniversity(data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load university.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUniversity();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading university...</p>
        </div>
      </Layout>
    );
  }

  if (error || !university) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">{error || 'University not found'}</p>
          <Link to="/">
            <Button variant="secondary" className="mt-4">Return to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitError(null);
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    try {
      const response = await fetch(`/api/universities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityName: data.get('universityName'),
          location: data.get('location'),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      alert('University updated successfully!');
      navigate('/');
    } catch {
      setSubmitError('Failed to save changes.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit University</h2>
          <p className="text-gray-600 mt-1">Update university information</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            {submitError && (
              <p className="text-sm text-red-600 mb-4">{submitError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Name *
                </label>
                <input
                  type="text"
                  required
                  name="universityName"
                  defaultValue={university.universityName}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  name="location"
                  defaultValue={university.location}
                  placeholder="City, State/Country"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
