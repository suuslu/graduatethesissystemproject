import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type Institute = {
  id: number;
  instituteName: string;
  universityId: number;
};

type University = {
  id: number;
  universityName: string;
};

export default function InstituteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadInstitute = async () => {
      setLoading(true);
      setError(null);
      try {
        const [instituteRes, universitiesRes] = await Promise.all([
          fetch(`/api/institutes/${id}`, { signal: controller.signal }),
          fetch('/api/universities', { signal: controller.signal }),
        ]);
        if (!instituteRes.ok) {
          throw new Error(`HTTP ${instituteRes.status}`);
        }
        const instituteData = await instituteRes.json();
        const universitiesData = universitiesRes.ok ? await universitiesRes.json() : [];
        setInstitute(instituteData);
        setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load institute.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadInstitute();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading institute...</p>
        </div>
      </Layout>
    );
  }

  if (error || !institute) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">{error || 'Institute not found'}</p>
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
      const response = await fetch(`/api/institutes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instituteName: data.get('instituteName'),
          universityId: Number(data.get('universityId')),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      alert('Institute updated successfully!');
      navigate('/');
    } catch {
      setSubmitError('Failed to save changes.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Institute</h2>
          <p className="text-gray-600 mt-1">Update institute information</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            {submitError && (
              <p className="text-sm text-red-600 mb-4">{submitError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institute Name *
                </label>
                <input
                  type="text"
                  required
                  name="instituteName"
                  defaultValue={institute.instituteName}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University *
                </label>
                <select
                  required
                  name="universityId"
                  defaultValue={institute.universityId}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.universityName}</option>
                  ))}
                </select>
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
