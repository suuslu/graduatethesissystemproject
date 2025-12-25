import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable, { Column } from '../components/DataTable';
import DeleteModal from '../components/DeleteModal';

type TabType = 'theses' | 'persons' | 'universities' | 'institutes';

type ThesisRow = {
  id: number;
  title: string;
  thesisYear: number;
  thesisType: string;
  authorName: string;
};

type PersonRow = {
  id: number;
  firstName: string;
  secondName: string;
  phoneNumber: string;
};

type UniversityRow = {
  id: number;
  universityName: string;
  location: string;
};

type InstituteRow = {
  id: number;
  instituteName: string;
  universityId: number;
  universityName?: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('theses');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string; entityType: string }>({
    isOpen: false,
    id: null,
    title: '',
    entityType: '',
  });
  const [theses, setTheses] = useState<ThesisRow[]>([]);
  const [thesesError, setThesesError] = useState<string | null>(null);
  const [thesesLoading, setThesesLoading] = useState(false);
  const [persons, setPersons] = useState<PersonRow[]>([]);
  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [entitiesError, setEntitiesError] = useState<string | null>(null);
  const [entitiesLoading, setEntitiesLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadTheses = async () => {
      setThesesLoading(true);
      setThesesError(null);
      try {
        const response = await fetch('/api/theses', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const mapped = (Array.isArray(data) ? data : []).map((row) => ({
          id: row.th_num,
          title: row.title,
          thesisYear: row.th_year,
          thesisType: row.th_type,
          authorName: row.author,
        }));
        setTheses(mapped);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setThesesError('Failed to load theses from the API.');
        }
      } finally {
        setThesesLoading(false);
      }
    };

    loadTheses();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadEntities = async () => {
      setEntitiesLoading(true);
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
      } finally {
        setEntitiesLoading(false);
      }
    };

    loadEntities();
    return () => controller.abort();
  }, []);

  const reloadTheses = async () => {
    try {
      const response = await fetch('/api/theses');
      if (!response.ok) return;
      const data = await response.json();
      const mapped = (Array.isArray(data) ? data : []).map((row) => ({
        id: row.th_num,
        title: row.title,
        thesisYear: row.th_year,
        thesisType: row.th_type,
        authorName: row.author,
      }));
      setTheses(mapped);
    } catch {
      // ignore reload errors
    }
  };

  const reloadEntities = async () => {
    try {
      const [personsRes, universitiesRes, institutesRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/universities'),
        fetch('/api/institutes'),
      ]);
      if (personsRes.ok) {
        const personsData = await personsRes.json();
        setPersons(Array.isArray(personsData) ? personsData : []);
      }
      if (universitiesRes.ok) {
        const universitiesData = await universitiesRes.json();
        setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
      }
      if (institutesRes.ok) {
        const institutesData = await institutesRes.json();
        setInstitutes(Array.isArray(institutesData) ? institutesData : []);
      }
    } catch {
      // ignore reload errors
    }
  };

  const thesisColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title', render: (value) => <div className="max-w-xs truncate">{value}</div> },
    { key: 'authorName', label: 'Author' },
    { key: 'thesisType', label: 'Type', render: (value) => (
      <span className={`inline-flex px-2 py-1 text-xs rounded ${
        value === 'PhD' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'thesisYear', label: 'Year' },
  ];

  const personColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'secondName', label: 'Last Name' },
    { key: 'phoneNumber', label: 'Phone' },
  ];

  const universityColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'universityName', label: 'University Name' },
    { key: 'location', label: 'Location' },
  ];

  const instituteColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'instituteName', label: 'Institute Name' },
    { key: 'universityName', label: 'University' },
  ];

  const handleDelete = (id: number, entityType: string) => {
    let title = '';
    switch (entityType) {
      case 'thesis':
        title = theses.find(t => t.id === id)?.title || '';
        break;
      case 'person':
        const person = persons.find(p => p.id === id);
        title = person ? `${person.firstName} ${person.secondName}` : '';
        break;
      case 'university':
        title = universities.find(u => u.id === id)?.universityName || '';
        break;
      case 'institute':
        title = institutes.find(i => i.id === id)?.instituteName || '';
        break;
    }
    setDeleteModal({ isOpen: true, id, title, entityType });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.entityType) {
      setDeleteModal({ isOpen: false, id: null, title: '', entityType: '' });
      return;
    }
    try {
      if (deleteModal.entityType === 'thesis') {
        setThesesError(null);
      } else {
        setEntitiesError(null);
      }
      const deletePath = deleteModal.entityType === 'thesis'
        ? `/api/theses/${deleteModal.id}`
        : deleteModal.entityType === 'university'
          ? `/api/universities/${deleteModal.id}`
          : `/api/${deleteModal.entityType}s/${deleteModal.id}`;
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
        if (deleteModal.entityType === 'thesis') {
          setThesesError(message);
        } else {
          setEntitiesError(message);
        }
        return;
      }
      if (deleteModal.entityType === 'thesis') {
        await reloadTheses();
      } else {
        await reloadEntities();
      }
    } catch {
      if (deleteModal.entityType === 'thesis') {
        setThesesError('Failed to delete from the API.');
      } else {
        setEntitiesError('Failed to delete from the API.');
      }
    } finally {
      setDeleteModal({ isOpen: false, id: null, title: '', entityType: '' });
    }
  };

  const tabs = [
    { id: 'theses' as TabType, label: 'Theses', count: theses.length },
    { id: 'persons' as TabType, label: 'Persons', count: persons.length },
    { id: 'universities' as TabType, label: 'Universities', count: universities.length },
    { id: 'institutes' as TabType, label: 'Institutes', count: institutes.length },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage all thesis records and related entities</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'theses' && (
            <>
              {thesesLoading && (
                <p className="text-sm text-gray-500 mb-3">Loading theses from the API...</p>
              )}
              {thesesError && (
                <p className="text-sm text-red-600 mb-3">{thesesError}</p>
              )}
              <DataTable
                columns={thesisColumns}
                data={theses}
                entityType="thesis"
                onDelete={(id) => handleDelete(id, 'thesis')}
              />
            </>
          )}
          {activeTab === 'persons' && (
            <>
              {entitiesLoading && (
                <p className="text-sm text-gray-500 mb-3">Loading people from the API...</p>
              )}
              {entitiesError && (
                <p className="text-sm text-red-600 mb-3">{entitiesError}</p>
              )}
              <DataTable
                columns={personColumns}
                data={persons}
                entityType="person"
                onDelete={(id) => handleDelete(id, 'person')}
              />
            </>
          )}
          {activeTab === 'universities' && (
            <>
              {entitiesLoading && (
                <p className="text-sm text-gray-500 mb-3">Loading universities from the API...</p>
              )}
              {entitiesError && (
                <p className="text-sm text-red-600 mb-3">{entitiesError}</p>
              )}
              <DataTable
                columns={universityColumns}
                data={universities}
                entityType="university"
                onDelete={(id) => handleDelete(id, 'university')}
              />
            </>
          )}
          {activeTab === 'institutes' && (
            <>
              {entitiesLoading && (
                <p className="text-sm text-gray-500 mb-3">Loading institutes from the API...</p>
              )}
              {entitiesError && (
                <p className="text-sm text-red-600 mb-3">{entitiesError}</p>
              )}
              <DataTable
                columns={instituteColumns}
                data={institutes}
                entityType="institute"
                onDelete={(id) => handleDelete(id, 'institute')}
              />
            </>
          )}
        </div>
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
