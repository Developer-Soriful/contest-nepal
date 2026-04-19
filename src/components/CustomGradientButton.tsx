import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  title: string;
  onPress: () => void;
  colors?: [string, string, ...string[]];
  outerBorderColor?: string;
  innerBorderColor?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
  style?: ViewStyle;
  borderRadius?: number;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const CustomGradientButton = ({
  title,
  onPress,
  colors = ["#990009", "#C21923", "#990009"],
  outerBorderColor = "#990009",
  innerBorderColor = "white",
  containerStyle,
  textStyle,
  style,
  borderRadius = 50,
  backgroundColor,
  disabled = false,
  isLoading = false,
}: Props) => {
  const gradientColors = backgroundColor
    ? ([backgroundColor, backgroundColor] as const)
    : colors;
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        { borderColor: outerBorderColor },
        containerStyle,
        animatedStyle,
      ]}
    >
      <AnimatedPressable
        onPress={disabled || isLoading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.touchable, { borderRadius }, style, { opacity: disabled || isLoading ? 0.5 : 1 }]}
        disabled={disabled || isLoading}
      >
        <LinearGradient
          colors={gradientColors}
          locations={[0.6438, 0.7543, 0.8646]}
          start={{ x: 1, y: 0.2 }}
          end={{ x: 0, y: 0.8 }}
          style={[
            styles.gradient,
            { borderColor: innerBorderColor, borderRadius },
          ]}
        >
          <Text style={[styles.text, textStyle]}>
            {isLoading ? "Loading..." : title}
          </Text>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 50,
  },
  touchable: {
    borderRadius: 50,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CustomGradientButton;
