import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearAuthSession, logoutUser } from '@/lib/api';

export function useLogout() {
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Still clear local session if the backend is unreachable.
    } finally {
      clearAuthSession();
      navigate('/login', { replace: true });
    }
  }, [navigate]);
}
