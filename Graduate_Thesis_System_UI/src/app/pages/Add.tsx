import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

type AddEntityType = 'Person' | 'University' | 'Institute' | 'Thesis';

type PersonRow = {
  id: number;
  firstName: string;
  secondName: string;
};

type UniversityRow = {
  id: number;
  universityName: string;
};

type InstituteRow = {
  id: number;
  instituteName: string;
  universityId: number;
};

export default function Add() {
  const navigate = useNavigate();
  const [entityType, setEntityType] = useState<AddEntityType>('Person');
  const [topics, setTopics] = useState<string[]>(['']);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [persons, setPersons] = useState<PersonRow[]>([]);
  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [entitiesError, setEntitiesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadEntities = async () => {
      setEntitiesError(null);
      try {
        const [personsRes, universitiesRes, institutesRes] = await Promise.all([
          fetch('/api/persons', { signal: controller.signal }),
          fetch('/api/universities', { signal: controller.signal }),
          fetch('/api/institutes', { signal: controller.signal }),
        ]);
        if (!personsRes.ok || !universitiesRes.ok || !institutesRes.ok) {
          throw new Error('HTTP error');
        }
        const [personsData, universitiesData, institutesData] = await Promise.all([
          personsRes.json(),
          universitiesRes.json(),
          institutesRes.json(),
        ]);
        setPersons(Array.isArray(personsData) ? personsData : []);
        setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
        setInstitutes(Array.isArray(institutesData) ? institutesData : []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setEntitiesError('Failed to load dropdown data from the API.');
        }
      }
    };

    loadEntities();
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    try {
      let endpoint = '';
      let payload: Record<string, any> = {};

      if (entityType === 'Person') {
        endpoint = '/api/persons';
        payload = {
          firstName: data.get('firstName'),
          secondName: data.get('secondName'),
          phoneNumber: data.get('phoneNumber'),
        };
      } else if (entityType === 'University') {
        endpoint = '/api/universities';
        payload = {
          universityName: data.get('universityName'),
          location: data.get('location'),
        };
      } else if (entityType === 'Institute') {
        endpoint = '/api/institutes';
        payload = {
          instituteName: data.get('instituteName'),
          universityId: Number(data.get('universityId')),
        };
      } else if (entityType === 'Thesis') {
        endpoint = '/api/theses';
        payload = {
          title: data.get('title'),
          abstract: data.get('abstract'),
          authorId: Number(data.get('authorId')),
          thesisYear: Number(data.get('thesisYear')),
          thesisType: data.get('thesisType'),
          universityId: Number(data.get('universityId')),
          instituteId: Number(data.get('instituteId')),
          pageCount: Number(data.get('pageCount')),
          language: data.get('language'),
          submissionDate: data.get('submissionDate'),
          topics: topics.map((t) => t.trim()).filter(Boolean),
          keywords: keywords.map((k) => k.trim()).filter(Boolean),
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error) {
            message = errorBody.error;
          }
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

      alert(`${entityType} added successfully!`);
      navigate('/');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save. Check the form and try again.');
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
          <h2 className="text-2xl font-semibold text-gray-900">Add New Data</h2>
          <p className="text-gray-600 mt-1">Insert new records into the database</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as AddEntityType)}
              className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Person">Person</option>
              <option value="University">University</option>
              <option value="Institute">Institute</option>
              <option value="Thesis">Thesis</option>
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            {entitiesError && (
              <p className="text-sm text-red-600 mb-4">{entitiesError}</p>
            )}
            {submitError && (
              <p className="text-sm text-red-600 mb-4">{submitError}</p>
            )}
            {/* Person Form */}
            {entityType === 'Person' && (
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
                    placeholder="+1-555-0100"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* University Form */}
            {entityType === 'University' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="universityName"
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
                    placeholder="City, State/Country"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Institute Form */}
            {entityType === 'Institute' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="instituteName"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select University</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.universityName}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Thesis Form */}
            {entityType === 'Thesis' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="title"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                  <select
                    required
                    name="authorId"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Author</option>
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
                      defaultValue={new Date().getFullYear()}
                      name="thesisYear"
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
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
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
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Language</option>
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
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <option value="">Select University</option>
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
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <option value="">Select Institute</option>
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
            )}

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit">
                Save {entityType}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
