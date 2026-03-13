import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const OrganizerInfo = ({
  name,
  avatar,
  onPress,
}: {
  name: string;
  avatar: any;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={avatar} style={styles.avatar} />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>Hosted by</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#EEE" },
  name: { fontSize: 15, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6B7280" },
});

export default OrganizerInfo;
