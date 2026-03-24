import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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
}

const CustomGradientButton = ({
  title,
  onPress,
  colors = ["#990009", "#C21923", "#990009"],
  outerBorderColor = "#990009",
  innerBorderColor = "white",
  containerStyle,
  textStyle,
  activeOpacity = 0.8,
  style,
  borderRadius = 50,
  backgroundColor,
}: Props) => {
  const gradientColors = backgroundColor
    ? ([backgroundColor, backgroundColor] as const)
    : colors;
  return (
    <View
      style={[
        styles.outerContainer,
        { borderColor: outerBorderColor },
        containerStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={[styles.touchable, { borderRadius }, style]}
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
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
