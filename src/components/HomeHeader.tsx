import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";

interface HomeHeaderProps {
    userName?: string;
    avatarUri?: string;
    onNotificationPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
    userName = "Alexa Donnal",
    avatarUri = "https://i.pravatar.cc/150?u=alexa",
    onNotificationPress,
}) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 10,
                marginTop: 10,
            }}
        >
            {/* Profile Section (Left) */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* User Avatar */}
                <TouchableOpacity onPress={() => router.navigate("/profile")}>
                    <Image
                        source={{ uri: avatarUri }}
                        style={{
                            width: 51,
                            height: 51,
                            borderRadius: 27,
                            borderWidth: 1,
                            borderColor: "#fff",
                        }}
                    />
                </TouchableOpacity>

                {/* Welcome Text */}
                <View style={{ marginLeft: 12 }}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#1A1C1E",
                            letterSpacing: 0.3,
                        }}
                    >
                        Welcome Back
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: "#666",
                            marginTop: 2,
                            fontWeight: "500",
                        }}
                    >
                        {userName}
                    </Text>
                </View>
            </View>

            {/* Notification Bell (Right) */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onNotificationPress}
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 24,
                    backgroundColor: "white",
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottomWidth: 2,
                    borderRightWidth: 0.1,
                    borderTopWidth: 0.1,
                    borderLeftWidth: 0.1,
                    borderBottomColor: "#990009",
                    borderRightColor: "#990009",
                    borderTopColor: "#990009",
                    borderLeftColor: "#990009",
                    ...Platform.select({
                        ios: {
                            shadowColor: "#990009",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                        },
                        android: {
                            elevation: 4,
                            shadowColor: "#990009",
                        },
                    }),
                }}
            >
                <View>
                    <Ionicons name="notifications-outline" size={24} color="#990009" />
                    <View
                        style={{
                            position: "absolute",
                            top: 2,
                            right: 3,
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#990009",
                            borderWidth: 1.5,
                            borderColor: "#FFF",
                        }}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default HomeHeader;
