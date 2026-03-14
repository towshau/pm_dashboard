import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StaffMember } from '../lib/types';

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('staff_database')
      .select('id, first_name, last_name, role, staff_status, home_gym, rgb_colour, lockeroom_email, employment_type')
      .eq('staff_status', 'active')
      .order('first_name')
      .then(({ data, error: e }) => {
        if (!mounted) return;
        if (e) {
          setError(e.message);
          setStaff([]);
        } else {
          setStaff((data as StaffMember[]) || []);
        }
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { staff, loading, error };
}
