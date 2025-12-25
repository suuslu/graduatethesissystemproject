import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type Person = {
  id: number;
  firstName: string;
  secondName: string;
  phoneNumber: string;
};

export default function PersonEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadPerson = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/persons/${id}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setPerson(data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load person.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading person...</p>
        </div>
      </Layout>
    );
  }

  if (error || !person) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">{error || 'Person not found'}</p>
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
      const response = await fetch(`/api/persons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.get('firstName'),
          secondName: data.get('secondName'),
          phoneNumber: data.get('phoneNumber'),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      alert('Person updated successfully!');
      navigate('/');
    } catch {
      setSubmitError('Failed to save changes.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Person</h2>
          <p className="text-gray-600 mt-1">Update person information</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            {submitError && (
              <p className="text-sm text-red-600 mb-4">{submitError}</p>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    defaultValue={person.firstName}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Second Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="secondName"
                    defaultValue={person.secondName}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  name="phoneNumber"
                  defaultValue={person.phoneNumber}
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
