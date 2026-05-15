import { useState } from 'react';
import { Download, ChevronRight, CheckCircle, Info, Copy, Star } from 'lucide-react';
import type { Team, Evaluation } from './types';
import { mockTeams, questions } from './data/mockData';

function App() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setCopied(false);
    if (!evaluations[team.id]) {
      const initialScores: Record<string, number> = {};
      const initialNotes: Record<string, string> = {};
      questions.forEach((q) => {
        initialScores[q.id] = 0;
        initialNotes[q.id] = '';
      });

      setEvaluations((prev) => ({
        ...prev,
        [team.id]: {
          teamId: team.id,
          scores: initialScores,
          notes: initialNotes,
          totalScore: 0,
        },
      }));
    }
  };

  const handleScoreChange = (teamId: string, questionId: string, value: number) => {
    setEvaluations((prev) => {
      const currentEval = prev[teamId];
      const newScores = { ...currentEval.scores, [questionId]: value };
      const totalScore = Object.values(newScores).reduce((sum, score) => sum + score, 0);

      return {
        ...prev,
        [teamId]: {
          ...currentEval,
          scores: newScores,
          totalScore,
        },
      };
    });
  };

  const handleNoteChange = (teamId: string, questionId: string, note: string) => {
    setEvaluations((prev) => {
      const currentEval = prev[teamId];
      return {
        ...prev,
        [teamId]: {
          ...currentEval,
          notes: { ...currentEval.notes, [questionId]: note },
        },
      };
    });
  };

  const handleManualTotalOverride = (teamId: string, total: number) => {
    setEvaluations((prev) => {
      const currentEval = prev[teamId];
      return {
        ...prev,
        [teamId]: {
          ...currentEval,
          totalScore: total,
        },
      };
    });
  };

  const markEvaluated = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status: 'evaluated' } : t))
    );
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam(prev => prev ? { ...prev, status: 'evaluated' } : null);
    }
  };

  const exportToCSV = () => {
    let csvContent = 'Team Name,Project,Total Score,';
    questions.forEach((q) => {
      csvContent += `${q.title} Score,${q.title} Note,`;
    });
    csvContent += '\n';

    teams.forEach((team) => {
      const ev = evaluations[team.id];
      if (ev) {
        let row = `"${team.name}","${team.project}",${ev.totalScore},`;
        questions.forEach((q) => {
          row += `${ev.scores[q.id]},"${ev.notes[q.id].replace(/"/g, '""')}",`;
        });
        csvContent += row + '\n';
      } else {
        csvContent += `"${team.name}","${team.project}",Pending Evaluation...\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pasha-hackathon-evaluations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to calculate 1-5 star rating
  const getStarRating = (totalScore: number) => {
    const maxPossible = questions.length * 10;
    // Normalize to 5 stars, rounding appropriately
    const rating = Math.round((totalScore / maxPossible) * 5);
    return Math.max(1, Math.min(5, rating)); // ensure between 1 and 5
  };

  // Helper to get combined feedback text
  const getCombinedFeedback = (ev: Evaluation) => {
    return questions
      .map(q => ev.notes[q.id]?.trim())
      .filter(note => note && note.length > 0)
      .join(' ');
  };

  const copyFeedback = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Pasha Hackathon 6.0</h1>
          <p className="text-blue-200 text-sm">Mentor Evaluation Dashboard</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
          aria-label="Export all evaluations to CSV"
        >
          <Download size={18} aria-hidden="true" />
          Export to CSV
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Teams List */}
        <aside className="w-1/3 max-w-sm bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-700">Teams ({teams.length})</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {teams.map((team) => (
              <li key={team.id}>
                <button
                  onClick={() => handleTeamSelect(team)}
                  className={`w-full text-left p-4 hover:bg-blue-50 focus-visible:outline-none focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 transition-colors flex items-center justify-between group ${
                    selectedTeam?.id === team.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                  }`}
                  aria-selected={selectedTeam?.id === team.id}
                  role="tab"
                >
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {team.name}
                      {team.status === 'evaluated' && (
                        <CheckCircle size={16} className="text-green-500" aria-label="Evaluated" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{team.project}</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content: Evaluation Form */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" aria-live="polite">
          {selectedTeam && evaluations[selectedTeam.id] ? (
            <div className="max-w-3xl mx-auto space-y-6 fade-in">
              {/* Questionnaire Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.name}</h2>
                    <p className="text-gray-500">Project: {selectedTeam.project}</p>
                  </div>
                  <div className="text-right">
                    <label htmlFor={`total-score-${selectedTeam.id}`} className="text-sm text-gray-500 mb-1 block">Total Score</label>
                    <input
                      id={`total-score-${selectedTeam.id}`}
                      type="number"
                      value={evaluations[selectedTeam.id].totalScore}
                      onChange={(e) => handleManualTotalOverride(selectedTeam.id, Number(e.target.value))}
                      className="w-20 text-2xl font-bold text-blue-700 text-right border rounded p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                      aria-label={`Total score for ${selectedTeam.name}`}
                    />
                    <div className="text-xs text-gray-400 mt-1">out of {questions.length * 10}</div>
                  </div>
                </div>

                <div className="space-y-8">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">{q.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Info size={14} aria-hidden="true" /> {q.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={evaluations[selectedTeam.id].scores[q.id]}
                            onChange={(e) => handleScoreChange(selectedTeam.id, q.id, Number(e.target.value))}
                            className="w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                            aria-label={`${q.title} score slider`}
                          />
                          <label htmlFor={`score-${selectedTeam.id}-${q.id}`} className="sr-only">{q.title} score</label>
                          <input
                            id={`score-${selectedTeam.id}-${q.id}`}
                            type="number"
                            min="0"
                            max="10"
                            value={evaluations[selectedTeam.id].scores[q.id]}
                            onChange={(e) => handleScoreChange(selectedTeam.id, q.id, Number(e.target.value))}
                            className="w-16 p-1 border rounded text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`note-${selectedTeam.id}-${q.id}`} className="sr-only">Note for {q.title}</label>
                        <input
                          id={`note-${selectedTeam.id}-${q.id}`}
                          type="text"
                          placeholder="Add a simple 1-line log note..."
                          value={evaluations[selectedTeam.id].notes[q.id]}
                          onChange={(e) => handleNoteChange(selectedTeam.id, q.id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-shadow"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => markEvaluated(selectedTeam.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} aria-hidden="true" />
                    Mark as Evaluated
                  </button>
                </div>
              </div>

              {/* Portal Output Card */}
              {selectedTeam.status === 'evaluated' && (
                <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 bg-blue-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Official Portal Output
                        <Info size={16} className="text-blue-500" aria-label="Copy this information to the official hackathon portal" />
                      </h3>
                      <p className="text-sm text-gray-500">Auto-generated summary ready for copy/pasting</p>
                    </div>
                    <button
                      onClick={() => copyFeedback(getCombinedFeedback(evaluations[selectedTeam.id]))}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-sm font-medium"
                      aria-label="Copy feedback text"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy Feedback'}
                    </button>
                  </div>

                  <div className="space-y-4 bg-white p-4 rounded border border-gray-200">
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">Please evaluate the team (general score) *</div>
                      <div className="flex items-center gap-1" aria-label={`Star rating: ${getStarRating(evaluations[selectedTeam.id].totalScore)} out of 5`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={24}
                            className={`${
                              star <= getStarRating(evaluations[selectedTeam.id].totalScore)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500 font-medium">
                          ({getStarRating(evaluations[selectedTeam.id].totalScore)} / 5)
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">Please mention the thing you liked the most about the team and idea</div>
                      <div className="p-3 bg-gray-50 rounded border border-gray-100 text-gray-700 text-sm min-h-[60px]">
                        {getCombinedFeedback(evaluations[selectedTeam.id]) || <span className="text-gray-400 italic">No notes provided. Add notes above to generate feedback.</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Info size={48} className="mx-auto mb-4 opacity-50" aria-hidden="true" />
                <p className="text-lg">Select a team from the sidebar to begin evaluation.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
