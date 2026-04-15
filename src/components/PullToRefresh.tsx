import React, { useCallback, useState } from 'react';
import {
    ColorValue,
    Platform,
    RefreshControl,
    ScrollView,
    ScrollViewProps,
    StyleSheet,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Colors for refresh indicator
const REFRESH_COLORS = {
  primary: '#990009', // Your app primary color
  background: Platform.OS === 'ios' ? 'transparent' : '#F5F5F5',
  tintColor: Platform.OS === 'ios' ? '#990009' : undefined,
};

interface PullToRefreshProps extends Omit<ScrollViewProps, 'refreshControl'> {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  refreshColors?: ColorValue[];
  refreshTintColor?: ColorValue;
  refreshTitle?: string;
  refreshTitleColor?: ColorValue;
  showDefaultLoader?: boolean;
  minRefreshTime?: number; // Minimum time to show refresh indicator (ms)
}

/**
 * Production-grade Pull-to-Refresh wrapper component
 * Usage: Wrap your screen content with this component
 * 
 * @example
 * <PullToRefresh onRefresh={customRefresh}>
 *   <YourContent />
 * </PullToRefresh>
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshColors = [REFRESH_COLORS.primary],
  refreshTintColor = REFRESH_COLORS.tintColor,
  refreshTitle = Platform.OS === 'ios' ? 'Pull to refresh' : undefined,
  refreshTitleColor,
  showDefaultLoader = true,
  minRefreshTime = 800, // Minimum 800ms to show spinner
  ...scrollViewProps
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUser, isLoading } = useAuth();

  const handleRefresh = useCallback(async () => {
    const startTime = Date.now();
    setRefreshing(true);

    try {
      console.log('[PullToRefresh] Starting refresh...');

      // Execute custom refresh if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Always refresh user data from AuthContext
      await refreshUser();

      // Ensure minimum refresh time for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < minRefreshTime) {
        await new Promise(resolve => setTimeout(resolve, minRefreshTime - elapsed));
      }

      console.log('[PullToRefresh] Refresh completed');
    } catch (error) {
      console.log('[PullToRefresh] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshUser, minRefreshTime]);

  // Don't show refresh control if ScrollView has horizontal prop
  const isHorizontal = scrollViewProps.horizontal;

  if (isHorizontal) {
    return (
      <ScrollView {...scrollViewProps}>
        {children}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        showDefaultLoader ? (
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleRefresh}
            colors={refreshColors}
            tintColor={refreshTintColor}
            title={refreshTitle}
            titleColor={refreshTitleColor}
            progressBackgroundColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            progressViewOffset={Platform.OS === 'android' ? 0 : undefined}
          />
        ) : undefined
      }
      style={[styles.container, scrollViewProps.style]}
      contentContainerStyle={[
        styles.contentContainer,
        scrollViewProps.contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default PullToRefresh;
