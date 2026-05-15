export interface Team {
  id: string;
  name: string;
  project: string;
  status: 'pending' | 'evaluated';
}

export interface Evaluation {
  teamId: string;
  scores: Record<string, number>;
  notes: Record<string, string>;
  totalScore: number;
}

export interface Question {
  id: string;
  title: string;
  description: string;
}
