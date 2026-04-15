import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface ContestCardSkeletonProps {
  count?: number;
  containerWidth?: number;
}

const SkeletonItem: React.FC<{ width: number }> = ({ width }) => {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-width, width]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.card, { width }]}>
      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder} />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Badge Placeholder */}
        <View style={styles.badgeRow}>
          <View style={styles.badge} />
          <View style={styles.statusBadge} />
        </View>

        {/* Title Placeholder */}
        <View style={styles.title} />
        <View style={[styles.title, { width: '60%', marginTop: 8 }]} />

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem} />
          <View style={styles.infoItem} />
        </View>

        {/* Button Placeholder */}
        <View style={styles.button} />
      </View>
    </View>
  );
};

export const ContestCardSkeleton: React.FC<ContestCardSkeletonProps> = ({
  count = 1,
  containerWidth = 300,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} width={containerWidth} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#e0e0e0',
    position: 'relative',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: '50%',
  },
  content: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 80,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  statusBadge: {
    width: 50,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  title: {
    width: '100%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  infoItem: {
    width: '45%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
  },
});

export default ContestCardSkeleton;
