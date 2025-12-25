import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type Person = {
  id: number;
  firstName: string;
  secondName: string;
  phoneNumber: string;
};

type Thesis = {
  id: number;
  title: string;
  thesisType: string;
  thesisYear: number;
  pageCount: number;
};

export default function PersonDetails() {
  const { id } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [authoredTheses, setAuthoredTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadPerson = async () => {
      setLoading(true);
      setError(null);
      try {
        const [personRes, thesesRes] = await Promise.all([
          fetch(`/api/persons/${id}`, { signal: controller.signal }),
          fetch(`/api/persons/${id}/theses`, { signal: controller.signal }),
        ]);
        if (!personRes.ok) {
          throw new Error(`HTTP ${personRes.status}`);
        }
        const personData = await personRes.json();
        const thesesData = thesesRes.ok ? await thesesRes.json() : [];
        setPerson(personData);
        setAuthoredTheses(Array.isArray(thesesData) ? thesesData : []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load person details.');
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
          <p className="text-gray-500">Loading person details...</p>
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

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Person Details</h2>
            <p className="text-gray-600 mt-1">View person information and related theses</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/edit/person/${person.id}`}>
              <Button>Edit</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <dl className="divide-y divide-gray-200">
            <DetailRow label="ID" value={person.id} />
            <DetailRow label="First Name" value={person.firstName} />
            <DetailRow label="Second Name" value={person.secondName} />
            <DetailRow label="Phone Number" value={person.phoneNumber} />
          </dl>
        </div>

        {authoredTheses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Authored Theses ({authoredTheses.length})
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {authoredTheses.map((thesis) => (
                <div key={thesis.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/details/thesis/${thesis.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {thesis.title}
                      </Link>
                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded ${
                          thesis.thesisType === 'PhD' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {thesis.thesisType}
                        </span>
                        <span>{thesis.thesisYear}</span>
                        <span>{thesis.pageCount} pages</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
