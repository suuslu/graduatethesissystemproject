import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';

type Thesis = {
  id: number;
  title: string;
  abstract: string;
  authorId: number;
  thesisYear: number;
  thesisType: string;
  universityId: number;
  instituteId: number;
  pageCount: number;
  language: string;
  submissionDate: string;
  topics: string[];
  keywords: string[];
};

type Person = {
  id: number;
  firstName: string;
  secondName: string;
};

type University = {
  id: number;
  universityName: string;
};

type Institute = {
  id: number;
  instituteName: string;
};

export default function ThesisEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [topics, setTopics] = useState<string[]>(['']);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatDateForInput = (value: string) => {
    if (!value) return '';
    if (value.includes('T')) return value.split('T')[0];
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return value;
  };

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadThesis = async () => {
      setLoading(true);
      setError(null);
      try {
        const [thesisRes, personsRes, universitiesRes, institutesRes] = await Promise.all([
          fetch(`/api/theses/${id}`, { signal: controller.signal }),
          fetch('/api/persons', { signal: controller.signal }),
          fetch('/api/universities', { signal: controller.signal }),
          fetch('/api/institutes', { signal: controller.signal }),
        ]);
        if (!thesisRes.ok) {
          throw new Error(`HTTP ${thesisRes.status}`);
        }
        const thesisData = await thesisRes.json();
        setThesis(thesisData);
        setTopics(Array.isArray(thesisData.topics) && thesisData.topics.length > 0 ? thesisData.topics : ['']);
        setKeywords(Array.isArray(thesisData.keywords) && thesisData.keywords.length > 0 ? thesisData.keywords : ['']);
        const personsData = personsRes.ok ? await personsRes.json() : [];
        const universitiesData = universitiesRes.ok ? await universitiesRes.json() : [];
        const institutesData = institutesRes.ok ? await institutesRes.json() : [];
        setPersons(Array.isArray(personsData) ? personsData : []);
        setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
        setInstitutes(Array.isArray(institutesData) ? institutesData : []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to load thesis.');
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
          <p className="text-gray-500">Loading thesis...</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !thesis) return;
    setSubmitError(null);
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    try {
      const response = await fetch(`/api/theses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.get('title'),
          abstract: data.get('abstract'),
          authorId: thesis.authorId,
          thesisYear: Number(data.get('thesisYear')),
          thesisType: data.get('thesisType'),
          universityId: Number(data.get('universityId')),
          instituteId: Number(data.get('instituteId')),
          pageCount: Number(data.get('pageCount')),
          language: data.get('language'),
          submissionDate: data.get('submissionDate'),
          topics: topics.map((t) => t.trim()).filter(Boolean),
          keywords: keywords.map((k) => k.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error) message = errorBody.error;
        } catch {
          try {
            const text = await response.text();
            if (text) message = text;
          } catch {
            // ignore parse errors
          }
        }
        throw new Error(message);
      }
      alert('Thesis updated successfully!');
      navigate('/');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save changes.');
    }
  };

  const addTopic = () => setTopics([...topics, '']);
  const removeTopic = (index: number) => setTopics(topics.filter((_, i) => i !== index));
  const updateTopic = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const addKeyword = () => setKeywords([...keywords, '']);
  const removeKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index));
  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Thesis</h2>
          <p className="text-gray-600 mt-1">Update thesis information</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            {submitError && (
              <p className="text-sm text-red-600 mb-4">{submitError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <textarea
                  required
                  rows={3}
                  name="title"
                  defaultValue={thesis.title}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract *
                </label>
                <textarea
                  required
                  rows={5}
                  name="abstract"
                  defaultValue={thesis.abstract}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author * (Read-only)
                  </label>
                  <select
                    disabled
                    name="authorId"
                    defaultValue={thesis.authorId}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                  >
                    {persons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.secondName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thesis Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max="2100"
                    name="thesisYear"
                    defaultValue={thesis.thesisYear}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thesis Type *
                  </label>
                  <select
                    required
                    name="thesisType"
                    defaultValue={thesis.thesisType}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    required
                    name="language"
                    defaultValue={thesis.language}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Turkish">Turkish</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University *
                  </label>
                  <select
                    required
                    name="universityId"
                    defaultValue={thesis.universityId}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.universityName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute *
                  </label>
                  <select
                    required
                    name="instituteId"
                    defaultValue={thesis.instituteId}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {institutes.map((i) => (
                      <option key={i.id} value={i.id}>{i.instituteName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    name="pageCount"
                    defaultValue={thesis.pageCount}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Date *
                  </label>
                    <input
                      type="date"
                      required
                      name="submissionDate"
                      defaultValue={formatDateForInput(thesis.submissionDate)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
              </div>

              {/* Topics */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Topics
                  </label>
                  <Button type="button" size="sm" onClick={addTopic}>
                    + Add Topic
                  </Button>
                </div>
                <div className="space-y-2">
                  {topics.map((topic, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => updateTopic(index, e.target.value)}
                        placeholder="Enter topic"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {topics.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => removeTopic(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Keywords
                  </label>
                  <Button type="button" size="sm" onClick={addKeyword}>
                    + Add Keyword
                  </Button>
                </div>
                <div className="space-y-2">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder="Enter keyword"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {keywords.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => removeKeyword(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
