import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import DataTable, { Column } from '../components/DataTable';
import DeleteModal from '../components/DeleteModal';
import { EntityType } from '../types';

export default function Search() {
  const [entityType, setEntityType] = useState<EntityType>('All');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [persons, setPersons] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [entitiesError, setEntitiesError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string; entityType: string }>({
    isOpen: false,
    id: null,
    title: '',
    entityType: '',
  });

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
          setEntitiesError('Failed to load people, universities, and institutes from the API.');
        }
      }
    };

    loadEntities();
    return () => controller.abort();
  }, []);

  const fetchThesisResults = async (searchType: EntityType) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, type: searchType }),
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
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map((row) => ({
      id: row.th_num,
      title: row.title,
      thesisYear: row.th_year,
      thesisType: row.th_type,
      authorName: row.author,
      _entityType: 'Thesis',
    }));
  };

  const handleSearch = async () => {
    setHasSearched(true);
    setSearchLoading(true);
    setSearchError(null);
    const trimmedKeyword = keyword.trim();
    const lowerKeyword = trimmedKeyword.toLowerCase();
    let results: any[] = [];

    if (!trimmedKeyword) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('Please enter a keyword to filter.');
      return;
    }

    try {
      if (entityType === 'All' || entityType === 'Thesis' || entityType === 'Topic' || entityType === 'Keyword') {
        const thesisResults = await fetchThesisResults(entityType);
        results = [...results, ...thesisResults];
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to search theses from the API.');
    }

    if (entityType === 'All' || entityType === 'Person') {
      const personResults = persons.filter(p =>
        p.firstName.toLowerCase().includes(lowerKeyword) ||
        p.secondName.toLowerCase().includes(lowerKeyword)
      ).map(p => ({ ...p, _entityType: 'Person' }));
      results = [...results, ...personResults];
    }

    if (entityType === 'All' || entityType === 'University') {
      const universityResults = universities.filter(u =>
        u.universityName.toLowerCase().includes(lowerKeyword) ||
        u.location.toLowerCase().includes(lowerKeyword)
      ).map(u => ({ ...u, _entityType: 'University' }));
      results = [...results, ...universityResults];
    }

    if (entityType === 'All' || entityType === 'Institute') {
      const instituteResults = institutes.filter(i =>
        i.instituteName.toLowerCase().includes(lowerKeyword)
      ).map(i => ({ ...i, _entityType: 'Institute' }));
      results = [...results, ...instituteResults];
    }

    setSearchResults(results);
    setSearchLoading(false);
  };

  const handleDelete = (id: number) => {
    const item = searchResults.find(r => r.id === id);
    if (!item) return;
    
    let title = '';
    if (item._entityType === 'Thesis') title = item.title;
    else if (item._entityType === 'Person') title = `${item.firstName} ${item.secondName}`;
    else if (item._entityType === 'University') title = item.universityName;
    else if (item._entityType === 'Institute') title = item.instituteName;
    
    setDeleteModal({ isOpen: true, id, title, entityType: item._entityType });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.entityType) {
      setDeleteModal({ isOpen: false, id: null, title: '', entityType: '' });
      return;
    }
    try {
      setEntitiesError(null);
      const type = deleteModal.entityType.toLowerCase();
      const deletePath = type === 'thesis'
        ? `/api/theses/${deleteModal.id}`
        : type === 'university'
          ? `/api/universities/${deleteModal.id}`
          : `/api/${type}s/${deleteModal.id}`;
      const response = await fetch(deletePath, { method: 'DELETE' });
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
        setEntitiesError(message);
        return;
      }
      if (type === 'person') {
        setPersons((prev) => prev.filter((p) => p.id !== deleteModal.id));
      } else if (type === 'university') {
        setUniversities((prev) => prev.filter((u) => u.id !== deleteModal.id));
      } else if (type === 'institute') {
        setInstitutes((prev) => prev.filter((i) => i.id !== deleteModal.id));
      }
    } catch {
      setEntitiesError('Failed to delete from the API.');
    } finally {
      setDeleteModal({ isOpen: false, id: null, title: '', entityType: '' });
      // Re-run search to update results
      handleSearch();
    }
  };

  const getColumns = (): Column[] => {
    if (entityType === 'All') {
      return [
        { key: '_entityType', label: 'Type', render: (value) => (
          <span className="inline-flex px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
            {value}
          </span>
        )},
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Information', render: (value, row) => {
          if (row._entityType === 'Thesis') return <div className="max-w-sm truncate">{row.title}</div>;
          if (row._entityType === 'Person') return `${row.firstName} ${row.secondName}`;
          if (row._entityType === 'University') return row.universityName;
          if (row._entityType === 'Institute') return row.instituteName;
          return value;
        }},
      ];
    }

    if (entityType === 'Thesis' || entityType === 'Topic' || entityType === 'Keyword') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title', render: (value) => <div className="max-w-md truncate">{value}</div> },
        { key: 'thesisType', label: 'Type', render: (value) => (
          <span className={`inline-flex px-2 py-1 text-xs rounded ${
            value === 'PhD' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {value}
          </span>
        )},
        { key: 'thesisYear', label: 'Year' },
      ];
    }

    if (entityType === 'Person') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'secondName', label: 'Last Name' },
        { key: 'phoneNumber', label: 'Phone' },
      ];
    }

    if (entityType === 'University') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'universityName', label: 'University Name' },
        { key: 'location', label: 'Location' },
      ];
    }

    if (entityType === 'Institute') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'instituteName', label: 'Institute Name' },
        { key: 'universityId', label: 'University', render: (value, row) => {
          if (row.universityName) return row.universityName;
          const university = universities.find((u) => u.id === value);
          return university ? university.universityName : value;
        }},
      ];
    }

    return [];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Search</h2>
          <p className="text-gray-600 mt-1">Search across all entities using keywords and filters</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {entitiesError && (
            <p className="text-sm text-red-600 mb-4">{entitiesError}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Thesis">Thesis</option>
                <option value="Person">Person</option>
                <option value="University">University</option>
                <option value="Institute">Institute</option>
                <option value="Topic">Topic</option>
                <option value="Keyword">Keyword</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Keyword
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter search term..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {hasSearched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Search Results
                <span className="ml-2 text-gray-500">({searchResults.length} found)</span>
              </h3>
            </div>

            {searchError && (
              <p className="text-sm text-red-600 mb-3">{searchError}</p>
            )}

            {searchLoading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-500">No results found for "{keyword}"</p>
              </div>
            ) : (
              <DataTable
                columns={getColumns()}
                data={searchResults}
                entityType={searchResults[0]?._entityType?.toLowerCase() || 'thesis'}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: '', entityType: '' })}
        onConfirm={confirmDelete}
        title={deleteModal.title}
      />
    </Layout>
  );
}
