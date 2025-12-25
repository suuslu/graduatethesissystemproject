import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type Institute = {
  id: number;
  instituteName: string;
  universityId: number;
  universityName?: string;
};

type Thesis = {
  id: number;
  title: string;
  thesisType: string;
  thesisYear: number;
  pageCount: number;
};

export default function InstituteDetails() {
  const { id } = useParams();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [relatedTheses, setRelatedTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadInstitute = async () => {
      setLoading(true);
      setError(null);
      try {
        const [instituteRes, thesesRes] = await Promise.all([
          fetch(`/api/institutes/${id}`, { signal: controller.signal }),
          fetch(`/api/institutes/${id}/theses`, { signal: controller.signal }),
        ]);
        if (!instituteRes.ok) {
          throw new Error(`HTTP ${instituteRes.status}`);
        }
        const instituteData = await instituteRes.json();
        const thesesData = thesesRes.ok ? await thesesRes.json() : [];
        setInstitute(instituteData);
        setRelatedTheses(Array.isArray(thesesData) ? thesesData : []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load institute details.');
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
          <p className="text-gray-500">Loading institute details...</p>
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
            <h2 className="text-2xl font-semibold text-gray-900">Institute Details</h2>
            <p className="text-gray-600 mt-1">View institute information and related data</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/edit/institute/${institute.id}`}>
              <Button>Edit</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <dl className="divide-y divide-gray-200">
            <DetailRow label="ID" value={institute.id} />
            <DetailRow label="Institute Name" value={institute.instituteName} />
            <DetailRow 
              label="University" 
              value={
                institute.universityId ? (
                  <Link to={`/details/university/${institute.universityId}`} className="text-blue-600 hover:underline">
                    {institute.universityName || 'Unknown'}
                  </Link>
                ) : 'Unknown'
              } 
            />
            <DetailRow label="Total Theses" value={relatedTheses.length} />
          </dl>
        </div>

        {relatedTheses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Related Theses ({relatedTheses.length})
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {relatedTheses.map((thesis) => (
                <div key={thesis.id} className="p-4 hover:bg-gray-50">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
