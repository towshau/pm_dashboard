import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useProjectsWithTimeline } from '../../hooks/useProjects';
import { useSubProjects } from '../../hooks/useProjects';
import { StaffPicker } from '../shared/StaffPicker';
import type { TaskStatus, Priority, Size } from '../../lib/types';

const STATUS_OPTIONS: TaskStatus[] = ['to_do', 'in_progress', 'review', 'blocked', 'done'];
const PRIORITY_OPTIONS: Priority[] = ['high', 'medium', 'low'];
const SIZE_OPTIONS: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

const statusLabels: Record<TaskStatus, string> = {
  to_do: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
};

interface NewTaskFormProps {
  /** When set, project is fixed and project dropdown is hidden */
  fixedProjectId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewTaskForm({ fixedProjectId, onSuccess, onCancel }: NewTaskFormProps) {
  const { projects } = useProjectsWithTimeline();
  const [projectId, setProjectId] = useState<string>(fixedProjectId ?? '');
  const { subProjects } = useSubProjects(projectId || null);

  const [title, setTitle] = useState('');
  const [subProjectId, setSubProjectId] = useState<string>('');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus>('to_do');
  const [priority, setPriority] = useState<Priority>('medium');
  const [size, setSize] = useState<Size>('M');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixedProjectId) setProjectId(fixedProjectId);
  }, [fixedProjectId]);

  useEffect(() => {
    if (!projectId) setSubProjectId('');
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = fixedProjectId ?? projectId;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!pid) {
      setError('Project is required');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase.from('pm_tasks').insert({
      project_id: pid,
      sub_project_id: subProjectId || null,
      dash_id: null,
      title: title.trim(),
      description: description.trim() || null,
      acceptance_criteria: acceptanceCriteria.trim() || null,
      owner_id: ownerId || null,
      status,
      priority,
      size,
      due_date: dueDate || null,
      sort_order: 0,
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSuccess();
  };

  const projectsList = projects.filter((p) => p.status === 'active');

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border-lighter)] bg-gray-50/50 space-y-3">
      <div className="text-[12px] font-semibold text-[var(--text-secondary)]">New task</div>
      {error && <div className="text-red-600 text-xs">{error}</div>}
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-2.5 py-1.5"
          placeholder="Task title"
          autoFocus
        />
      </div>
      {!fixedProjectId && (
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Project *</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-2.5 py-1.5"
            required
          >
            <option value="">Select project</option>
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      {projectId && subProjects.length > 0 && (
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Sub-project</label>
          <select
            value={subProjectId}
            onChange={(e) => setSubProjectId(e.target.value)}
            className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-2.5 py-1.5"
          >
            <option value="">None</option>
            {subProjects.map((sp) => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Assignee</label>
        <StaffPicker selectedId={ownerId} onSelect={setOwnerId} size="xs" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-2.5 py-1.5 resize-y min-h-[60px]"
          placeholder="Describe the task…"
          rows={3}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Acceptance Criteria</label>
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
        {generateError && <div className="text-red-600 text-[11px] mb-1">{generateError}</div>}
        <textarea
          value={acceptanceCriteria}
          onChange={(e) => setAcceptanceCriteria(e.target.value)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-2.5 py-1.5 resize-y min-h-[60px]"
          placeholder="Click Generate or type manually…"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full text-[12px] border border-[var(--border-light)] rounded-lg px-2 py-1"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full text-[12px] border border-[var(--border-light)] rounded-lg px-2 py-1"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as Size)}
            className="w-full text-[12px] border border-[var(--border-light)] rounded-lg px-2 py-1"
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-0.5">Due date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full text-[13px] border border-[var(--border-light)] rounded-lg px-2.5 py-1.5"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--sidebar-accent)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
