import { import_img } from "@/assets/import_img";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Platform, Text, View } from "react-native";
import CustomGradientButton from "./CustomGradientButton";

import { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

interface ContestCardProps {
  type?: "compact" | "full";
  title: string;
  reward: string;
  date: string;
  joined: string;
  isActive?: boolean;
  imageSource?: ImageSourcePropType;
  buttonTitle?: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  badgeText?: string;
  showBadge?: boolean;
  showStatus?: boolean;
}

const ContestCard: React.FC<ContestCardProps> = ({
  type = "full",
  title,
  reward,
  date,
  joined,
  isActive = true,
  imageSource = import_img.gaming_setup_neon,
  buttonTitle = "View Details",
  onPress = () => router.push("/contest-detail"),
  containerStyle,
  badgeText = "Giveaway",
  showBadge = true,
  showStatus = true,
}) => {
  const isCompact = type === "compact";

  return (
    <View
      style={[
        {
          width: isCompact ? 260 : "100%",
          backgroundColor: "#fff",
          borderRadius: 22,
          padding: 12,
          marginBottom: isCompact ? 0 : 20,
          marginRight: isCompact ? 16 : 0,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        containerStyle,
      ]}
    >
      {/* Image Container */}
      <View style={{ position: "relative" }}>
        <Image
          source={imageSource}
          style={{
            width: "100%",
            height: isCompact ? 140 : 170,
            borderRadius: 18,
          }}
          resizeMode="cover"
        />
        {/* Giveaway Badge */}
        {showBadge && (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(0,0,0,0.3)",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.5)",
            }}
          >
            <Ionicons name="gift-outline" size={14} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 10,
                fontWeight: "600",
                marginLeft: 4,
              }}
            >
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ marginTop: 12, paddingHorizontal: 4 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1A1C1E",
            marginBottom: 8,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Ionicons name="trophy-outline" size={16} color="#666" />
          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginLeft: 6,
              fontWeight: "500",
            }}
          >
            {reward}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={{ fontSize: 12, color: "#666", marginLeft: 6 }}>
              {date}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={{ fontSize: 12, color: "#666", marginLeft: 6 }}>
              {joined} joined
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        {showStatus && (
          <View
            style={{
              backgroundColor: "#e8f7ee",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: "flex-start",
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#22c55e",
                marginRight: 6,
              }}
            />
            <Text style={{ color: "#22c55e", fontSize: 12, fontWeight: "600" }}>
              {isActive ? "Active" : "Ended"}
            </Text>
          </View>
        )}
        {/* View Details Button */}
        <CustomGradientButton
          title={buttonTitle}
          containerStyle={{ borderWidth: 0, borderRadius: 12 }}
          onPress={onPress}
        />
      </View>
    </View>
  );
};

export default ContestCard;
