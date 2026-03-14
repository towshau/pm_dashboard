import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StaffPicker } from '../shared/StaffPicker';
import type { Team } from '../../lib/types';
import { TEAM_COLORS } from '../../lib/types';

const TEAMS: Team[] = ['Admin', 'Maintenance', 'Leadership', 'Managers', 'Subsidiary', 'Marketing'];

interface NewProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewProjectForm({ onSuccess, onCancel }: NewProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [editingCriteria, setEditingCriteria] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [team, setTeam] = useState<Team>('Admin');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setError(null);
    setSubmitting(true);
    const teamColor = TEAM_COLORS[team];
    const { error: err } = await supabase.from('pm_projects').insert({
      name: name.trim(),
      description: description.trim() || null,
      acceptance_criteria: acceptanceCriteria.trim() || null,
      owner_id: ownerId || null,
      team,
      team_color: teamColor,
      status: 'active',
      start_date: startDate || null,
      target_end_date: targetEndDate || null,
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">New project</h3>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2"
          placeholder="Project name"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2 min-h-[60px]"
          placeholder="Optional description"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Acceptance Criteria</label>
          <div className="flex items-center gap-1.5">
            {acceptanceCriteria && !editingCriteria && (
              <button
                type="button"
                onClick={() => setEditingCriteria(true)}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              disabled={generating || !description.trim()}
              onClick={async () => {
                setGenerating(true);
                setGenerateError(null);
                try {
                  const res = await fetch('/api/generate-task-criteria', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: description.trim() }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error ?? 'Generation failed');
                  setAcceptanceCriteria(data.criteria ?? '');
                  setEditingCriteria(false);
                } catch (err: unknown) {
                  setGenerateError(err instanceof Error ? err.message : 'Generation failed');
                } finally {
                  setGenerating(false);
                }
              }}
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {generating && (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
        {generateError && <div className="text-red-600 text-[11px] mb-1">{generateError}</div>}
        {acceptanceCriteria && !editingCriteria ? (
          <div
            className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2 bg-white min-h-[60px] cursor-text"
            onClick={() => setEditingCriteria(true)}
          >
            {acceptanceCriteria.split('\n\n').map((section, i) => {
              const [heading, ...body] = section.split('\n');
              const isHeading = body.length > 0 && !heading.startsWith('•');
              return (
                <div key={i} className={i > 0 ? 'mt-3' : ''}>
                  {isHeading ? (
                    <>
                      <div className="font-semibold text-[var(--text-primary)] text-[12px] mb-0.5">{heading}</div>
                      {body.map((line, j) => (
                        <div key={j} className="text-[var(--text-secondary)] leading-relaxed">{line}</div>
                      ))}
                    </>
                  ) : (
                    section.split('\n').map((line, j) => (
                      <div key={j} className="text-[var(--text-secondary)] leading-relaxed">{line}</div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <textarea
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            onBlur={() => { if (acceptanceCriteria.trim()) setEditingCriteria(false); }}
            className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2 resize-y min-h-[60px]"
            placeholder="Click Generate or type manually…"
            rows={4}
            autoFocus={editingCriteria}
          />
        )}
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Owner</label>
        <StaffPicker selectedId={ownerId} onSelect={setOwnerId} size="sm" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Team *</label>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value as Team)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2"
        >
          {TEAMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Target end date</label>
          <input
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-3 py-2"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--sidebar-accent)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create project'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
