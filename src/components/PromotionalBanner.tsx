import { import_img } from "@/assets/import_img";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PromotionalBannerProps {
  marginTop?: number;
  marginBottom?: number;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  marginTop = 20,
  marginBottom = 0,
}) => {
  const handleJoinNowPress = () => {
    // Drive users into the primary conversion flow: browsing active contests.
    router.push({
      pathname: "/all-contests",
      params: { section: "all" },
    });
  };
  return (
    <View
      style={{
        marginTop,
        paddingHorizontal: 18,
        marginBottom,
        position: "relative",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 24,
          left: 41,
          zIndex: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          height: "70%",
          gap: 8,
        }}
      >
        <Text
          style={{
            maxWidth: 123,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          The Gaming
          <Text style={{ color: "#990009" }}> Contest</Text> Hub
        </Text>
        <TouchableOpacity
          onPress={handleJoinNowPress}
          accessibilityRole="button"
          accessibilityLabel="Join now and browse active contests"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#000000",
            padding: 8,
            borderRadius: 30,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <View>
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>
              Join Now
            </Text>
          </View>
          <View>
            <MaterialCommunityIcons name="play-pause" size={18} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      <Image
        source={import_img.game_win}
        style={{
          width: "100%",
          height: 185,
          borderRadius: 35,
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1,
          maxHeight: 227,
          maxWidth: 227,
        }}
      />
      <Image
        source={import_img.geming}
        style={{ width: "100%", height: 185, borderRadius: 35 }}
      />
    </View>
  );
};

export default PromotionalBanner;
