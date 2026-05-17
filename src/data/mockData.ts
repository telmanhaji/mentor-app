import type { Team, Question } from '../types';

export const mockTeams: Team[] = [
  { id: 't1', name: 'Code Wizards', project: 'Smart City App', status: 'pending' },
  { id: 't2', name: 'Data Miners', project: 'AI Health Predictor', status: 'pending' },
  { id: 't3', name: 'Green Tech', project: 'Recycling Tracker', status: 'pending' },
  { id: 't4', name: 'FinTech Innovators', project: 'Micro-loan Platform', status: 'pending' },
  { id: 't5', name: 'EduBuild', project: 'VR Classroom', status: 'pending' },
];

export const questions: Question[] = [
  { id: 'q1', title: 'Question.1', description: 'Innovation and Originality (0-10)' },
  { id: 'q2', title: 'Question.2', description: 'Technical Complexity (0-10)' },
  { id: 'q3', title: 'Question.3', description: 'Business Viability (0-10)' },
  { id: 'q4', title: 'Question.4', description: 'Presentation and Pitch (0-10)' },
  { id: 'q5', title: 'Question.5', description: 'Impact and Feasibility (0-10)' },
];
