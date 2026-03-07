import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
    title: string;
    onViewAllPress?: () => void;
    showArrow?: boolean;
    arrowIcon?: 'arrow-forward-circle-outline' | 'grid-outline';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    onViewAllPress,
    showArrow = true,
    arrowIcon = 'arrow-forward-circle-outline',
}) => {
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
            }}
        >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1C1E" }}>
                {title}
            </Text>
            {showArrow && (
                <TouchableOpacity
                    onPress={onViewAllPress}
                    style={{
                        backgroundColor: "#dde8ea",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 12,
                            color: "#666",
                            fontWeight: "600",
                            marginRight: 4,
                        }}
                    >
                        View all
                    </Text>
                    <Ionicons
                        name={arrowIcon}
                        size={14}
                        color="#990009"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SectionHeader;
