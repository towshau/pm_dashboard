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
