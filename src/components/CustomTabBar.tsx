import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const focusedIndex = useSharedValue(state.index);

  useEffect(() => {
    focusedIndex.value = state.index;
  }, [state.index, focusedIndex]);

  return (
    <View
      style={{
        position: "absolute",
        bottom: Platform.OS === "ios" ? Math.max(insets.bottom, 20) : Math.max(insets.bottom, 16),
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 18,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 4,
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 53.991,
          borderWidth: 1,
          borderColor: "white",
          backgroundColor: "#ebf3f4",

          ...Platform.select({
            ios: {
              shadowColor: "rgba(0, 0, 0, 0.20)",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 4,
            },
            android: {
              elevation: 5,
            },
          }),
          width: "100%",
          height: 60,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getTabIcon = (name: string): any => {
            if (name === "index" || name === "Home") return "home-outline";
            if (name === "calendar" || name === "Calendar")
              return "calendar-clear-outline";
            if (name === "graph" || name === "Graph") return "pulse-outline";
            if (name === "menu" || name === "Menu") return "grid-outline";
            return "home-outline";
          };

          const animatedStyle = useAnimatedStyle(() => {
            const isFocused = focusedIndex.value === index;
            return {
              width: withTiming(isFocused ? 120 : 52, { duration: 300, easing: Easing.out(Easing.exp) }),
              transform: [
                { scale: withTiming(isFocused ? 1.05 : 1, { duration: 200 }) }
              ]
            };
          });

          const iconAnimatedStyle = useAnimatedStyle(() => {
            const isFocused = focusedIndex.value === index;
            return {
              transform: [
                { scale: withTiming(isFocused ? 1.1 : 1, { duration: 200 }) }
              ],
              opacity: withTiming(isFocused ? 1 : 0.7, { duration: 200 })
            };
          });
          return (
            <Animated.View
              key={index}
              style={animatedStyle}
            >
              <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                style={{
                  width: '100%',
                  height: 52,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
              {isFocused ? (
                <LinearGradient
                  colors={["#990009", "#C21923"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    borderRadius: 26,
                    paddingHorizontal: 4,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#FFFFFF",
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <Ionicons
                      name={getTabIcon(route.name)}
                      size={20}
                      color="#000000"
                    />
                  </View>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: "600",
                      marginLeft: 10,
                    }}
                    numberOfLines={1}
                  >
                    {route.name === "index"
                      ? "Home"
                      : route.name.charAt(0).toUpperCase() +
                        route.name.slice(1)}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={getTabIcon(route.name)}
                    size={22}
                    color="#000000"
                  />
                </View>
              )}
            </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
