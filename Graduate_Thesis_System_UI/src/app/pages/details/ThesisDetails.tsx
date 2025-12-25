import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type Thesis = {
  id: number;
  title: string;
  abstract: string;
  authorId: number;
  authorName?: string;
  thesisYear: number;
  thesisType: string;
  universityId: number;
  universityName?: string;
  instituteId: number;
  instituteName?: string;
  pageCount: number;
  language: string;
  submissionDate: string;
  topics: string[];
  keywords: string[];
};

export default function ThesisDetails() {
  const { id } = useParams();
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadThesis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/theses/${id}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setThesis({
          ...data,
          topics: Array.isArray(data.topics) ? data.topics : [],
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load thesis details.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadThesis();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading thesis details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !thesis) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">{error || 'Thesis not found'}</p>
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
            <h2 className="text-2xl font-semibold text-gray-900">Thesis Details</h2>
            <p className="text-gray-600 mt-1">View complete thesis information</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/edit/thesis/${thesis.id}`}>
              <Button>Edit</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <dl className="divide-y divide-gray-200">
            <DetailRow label="ID" value={thesis.id} />
            <DetailRow label="Title" value={thesis.title} />
            <DetailRow 
              label="Abstract" 
              value={<p className="whitespace-pre-wrap">{thesis.abstract}</p>} 
            />
            <DetailRow 
              label="Author" 
              value={
                <Link to={`/details/person/${thesis.authorId}`} className="text-blue-600 hover:underline">
                  {thesis.authorName || 'Unknown'}
                </Link>
              } 
            />
            <DetailRow label="Thesis Year" value={thesis.thesisYear} />
            <DetailRow 
              label="Thesis Type" 
              value={
                <span className={`inline-flex px-2 py-1 text-xs rounded ${
                  thesis.thesisType === 'PhD' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {thesis.thesisType}
                </span>
              } 
            />
            <DetailRow 
              label="University" 
              value={
                <Link to={`/details/university/${thesis.universityId}`} className="text-blue-600 hover:underline">
                  {thesis.universityName || 'Unknown'}
                </Link>
              } 
            />
            <DetailRow 
              label="Institute" 
              value={
                <Link to={`/details/institute/${thesis.instituteId}`} className="text-blue-600 hover:underline">
                  {thesis.instituteName || 'Unknown'}
                </Link>
              } 
            />
            <DetailRow label="Page Count" value={thesis.pageCount} />
            <DetailRow 
              label="Language" 
              value={
                <span className="inline-flex px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                  {thesis.language}
                </span>
              } 
            />
            <DetailRow 
              label="Submission Date" 
              value={thesis.submissionDate ? new Date(thesis.submissionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'} 
            />
            <DetailRow 
              label="Topics" 
              value={
                <div className="flex flex-wrap gap-2">
                  {thesis.topics.map((topic, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800">
                      {topic}
                    </span>
                  ))}
                </div>
              } 
            />
            <DetailRow 
              label="Keywords" 
              value={
                <div className="flex flex-wrap gap-2">
                  {thesis.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              } 
            />
          </dl>
        </div>
      </div>
    </Layout>
  );
}
