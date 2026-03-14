import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityLabel } from '../shared/PriorityLabel';
import { SizeLabel } from '../shared/SizeLabel';
import { InlineDatePicker } from '../shared/InlineDatePicker';
import { MultiStaffPicker } from '../shared/MultiStaffPicker';
import type { Task, TaskStatus, Priority, Size } from '../../lib/types';
import { supabase } from '../../lib/supabase';

export function TaskRow({ task, onTaskUpdated }: { task: Task; onTaskUpdated?: () => void }) {
  const subLabel = task.sub_project_name ? `Sub: ${task.sub_project_name}` : null;
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [size, setSize] = useState<Size>(task.size ?? 'M');
  const [dueDate, setDueDate] = useState<string | null>(task.due_date);

  useEffect(() => {
    setStatus(task.status);
    setPriority(task.priority);
    setSize(task.size ?? 'M');
    setDueDate(task.due_date);
  }, [task.status, task.priority, task.size, task.due_date]);

  useEffect(() => {
    const ids: string[] = [];
    if (task.owner_id) ids.push(task.owner_id);
    supabase
      .from('pm_task_collaborators')
      .select('staff_id')
      .eq('task_id', task.id)
      .then(({ data }) => {
        const collabIds = (data || []).map((r: { staff_id: string }) => r.staff_id);
        setAssigneeIds([...new Set([...ids, ...collabIds])]);
      });
  }, [task.id, task.owner_id]);

  const updateField = useCallback(async (field: string, value: unknown) => {
    await supabase.from('pm_tasks').update({ [field]: value }).eq('id', task.id);
    onTaskUpdated?.();
  }, [task.id, onTaskUpdated]);

  const handleStatusChange = (s: TaskStatus) => { setStatus(s); updateField('status', s); };
  const handlePriorityChange = (p: Priority) => { setPriority(p); updateField('priority', p); };
  const handleSizeChange = (s: Size) => { setSize(s); updateField('size', s); };
  const handleDateChange = (d: string) => { setDueDate(d); updateField('due_date', d); };

  const toggleAssignee = useCallback(async (staffId: string) => {
    const isOwner = staffId === task.owner_id;
    if (assigneeIds.includes(staffId) && !isOwner) {
      await supabase.from('pm_task_collaborators').delete().eq('task_id', task.id).eq('staff_id', staffId);
      setAssigneeIds((prev) => prev.filter((id) => id !== staffId));
    } else if (!assigneeIds.includes(staffId)) {
      if (!task.owner_id) {
        await supabase.from('pm_tasks').update({ owner_id: staffId }).eq('id', task.id);
      } else {
        await supabase.from('pm_task_collaborators').upsert({ task_id: task.id, staff_id: staffId });
      }
      setAssigneeIds((prev) => [...new Set([...prev, staffId])]);
    }
  }, [task.id, task.owner_id, assigneeIds]);

  return (
    <div className="flex items-center py-2 px-4 border-t border-[var(--border-lighter)] gap-2 hover:bg-gray-50/80">
      <div className="w-6 flex-shrink-0 border-l-2 border-[var(--border-light)] h-7 ml-1.5" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-[13px] block">{task.title}</span>
        {subLabel && <span className="text-[11px] text-[#9ca3af] block mt-0.5">{subLabel}</span>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <MultiStaffPicker
          selectedIds={assigneeIds}
          onToggle={toggleAssignee}
          mainOwnerId={task.owner_id}
        />
        <StatusBadge status={status} onChange={handleStatusChange} />
        <PriorityLabel priority={priority} onChange={handlePriorityChange} />
        <SizeLabel size={size} onChange={handleSizeChange} />
        <InlineDatePicker value={dueDate} onChange={handleDateChange} />
      </div>
    </div>
  );
}
