import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UsePullToRefreshOptions {
  onRefresh?: () => Promise<void> | void;
  minRefreshTime?: number;
  showToast?: boolean;
}

interface UsePullToRefreshReturn {
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
  triggerRefresh: () => void;
}

/**
 * Custom hook for pull-to-refresh functionality
 * Works with any ScrollView or FlatList
 * 
 * @example
 * const { refreshing, handleRefresh } = usePullToRefresh();
 * 
 * <ScrollView
 *   refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
 * >
 *   <YourContent />
 * </ScrollView>
 */
export const usePullToRefresh = (options: UsePullToRefreshOptions = {}): UsePullToRefreshReturn => {
  const { onRefresh, minRefreshTime = 800 } = options;
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUser } = useAuth();

  const handleRefresh = useCallback(async () => {
    const startTime = Date.now();
    setRefreshing(true);

    try {
      console.log('[usePullToRefresh] Starting refresh...');

      // Execute custom refresh callback if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Always refresh user data from server
      await refreshUser();

      // Ensure minimum refresh time for smooth UX
      const elapsed = Date.now() - startTime;
      if (elapsed < minRefreshTime) {
        await new Promise(resolve => setTimeout(resolve, minRefreshTime - elapsed));
      }

      console.log('[usePullToRefresh] Refresh completed');
    } catch (error) {
      console.log('[usePullToRefresh] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshUser, minRefreshTime]);

  // Programmatically trigger refresh
  const triggerRefresh = useCallback(() => {
    if (!refreshing) {
      handleRefresh();
    }
  }, [refreshing, handleRefresh]);

  return {
    refreshing,
    handleRefresh,
    triggerRefresh,
  };
};

export default usePullToRefresh;
