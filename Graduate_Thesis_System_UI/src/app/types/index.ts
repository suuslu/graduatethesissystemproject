export interface Person {
  id: number;
  firstName: string;
  secondName: string;
  phoneNumber: string;
}

export interface University {
  id: number;
  universityName: string;
  location: string;
}

export interface Institute {
  id: number;
  instituteName: string;
  universityId: number;
  universityName?: string;
}

export interface Thesis {
  id: number;
  title: string;
  abstract: string;
  authorId: number;
  authorName?: string;
  thesisYear: number;
  thesisType: 'Master' | 'PhD';
  universityId: number;
  universityName?: string;
  instituteId: number;
  instituteName?: string;
  pageCount: number;
  language: 'English' | 'Turkish' | 'German' | 'French';
  submissionDate: string;
  topics: string[];
  keywords: string[];
}

export type EntityType = 'Thesis' | 'Person' | 'University' | 'Institute' | 'Topic' | 'Keyword' | 'All';
