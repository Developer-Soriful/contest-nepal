import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PromotionalBannerItem, contestApi } from "../services/api";

interface PromotionalBannerProps {
  marginTop?: number;
  marginBottom?: number;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  marginTop = 20,
  marginBottom = 0,
}) => {
  const flatListRef = useRef<FlatList<PromotionalBannerItem> | null>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [banners, setBanners] = useState<PromotionalBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const appStateRef = useRef(AppState.currentState);
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 36;
  const cardWidth = screenWidth - horizontalPadding;
  const defaultBanner = useMemo<PromotionalBannerItem>(() => ({
    id: "default-promotional-banner",
    title: "The Gaming Contest Nepal",
    subtitle: "Explore active contests, join the fun, and compete for exciting rewards.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    ctaLabel: "Join Now",
    sortOrder: 999999,
    isActive: true,
    contest: null,
  }), []);

  const loadBanners = useCallback(async () => {
    setLoading(true);

    try {
      const response = await contestApi.getPromotionalBanners();

      if (response.success && response.data?.items) {
        const customBanners = response.data.items.filter((item) => item.contest?.id);
        setBanners([...customBanners, defaultBanner]);
      } else {
        setBanners([defaultBanner]);
      }
    } catch (error) {
      console.log("[PromotionalBanner] Failed to load banners:", error);
      setBanners([defaultBanner]);
    } finally {
      setLoading(false);
    }
  }, [defaultBanner]);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  useFocusEffect(
    useCallback(() => {
      void loadBanners();
    }, [loadBanners])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        previousState.match(/inactive|background/) &&
        nextState === "active"
      ) {
        void loadBanners();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadBanners]);

  const handleJoinNowPress = useCallback((banner: PromotionalBannerItem) => {
    if (banner.contest?.id) {
      router.push(`/contest-detail?contestId=${banner.contest.id}`);
      return;
    }

    router.push({
      pathname: "/all-contests",
      params: { section: "all" },
    });
  }, []);

  const handleMomentumEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setCurrentIndex(nextIndex);
  }, [cardWidth]);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev >= banners.length - 1 ? 0 : prev + 1;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * cardWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 3500);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [banners.length, cardWidth]);

  const indicatorIndexes = useMemo(() => banners.map((_, index) => index), [banners]);

  if (loading) {
    return (
      <View
        style={{
          marginTop,
          paddingHorizontal: 18,
          marginBottom,
          minHeight: 185,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="small" color="#990009" />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        marginTop,
        paddingHorizontal: 18,
        marginBottom,
      }}
    >
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) => (
          <View
            style={{
              width: cardWidth,
              height: 185,
              borderRadius: 35,
              overflow: "hidden",
              backgroundColor: "#F8F5F0",
              marginRight: 0,
            }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />
            <View
              style={{
                flex: 1,
                paddingHorizontal: 24,
                paddingVertical: 24,
                justifyContent: "space-between",
                maxWidth: "62%",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 21,
                    fontWeight: "800",
                    color: "#161616",
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                {!!item.subtitle && (
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 18,
                      color: "#3A3A3A",
                    }}
                    numberOfLines={3}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleJoinNowPress(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open promoted contest ${item.contest?.title || item.title}`}
                style={{
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#000000",
                  borderRadius: 30,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>
                  {item.ctaLabel || "Join Now"}
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {indicatorIndexes.length > 1 ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
          {indicatorIndexes.map((index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 22 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: index === currentIndex ? "#990009" : "#D1D5DB",
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default PromotionalBanner;
