import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface LogAuditParams {
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  module?: 'membership' | 'office_management';
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAudit = async ({
    action,
    entityType,
    entityId,
    oldData,
    newData,
    module,
  }: LogAuditParams) => {
    if (!user) {
      console.warn('Cannot log audit: No user logged in');
      return;
    }

    try {
      const { error } = await supabase.rpc('log_audit', {
        _user_id: user.id,
        _action: action,
        _entity_type: entityType,
        _entity_id: entityId || null,
        _old_data: oldData ? JSON.stringify(oldData) : null,
        _new_data: newData ? JSON.stringify(newData) : null,
        _module: module || null,
      });

      if (error) {
        console.error('Error logging audit:', error);
      }
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  };

  const logAction = async (action: string, details?: string) => {
    await logAudit({
      action,
      entityType: 'system',
      newData: { details },
    });
  };

  return { logAudit, logAction };
}
