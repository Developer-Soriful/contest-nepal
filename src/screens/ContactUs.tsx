import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const ContactUs = () => {
  const handleInstagram = () => {
    const instagramUrl = "https://instagram.com/your_handle";
    Linking.canOpenURL(instagramUrl).then((supported) => {
      if (supported) {
        Linking.openURL(instagramUrl);
      } else {
        Alert.alert("Error", "Cannot open Instagram");
      }
    });
  };

  const handleEmail = () => {
    const emailUrl = "mailto:support@example.com";
    Linking.canOpenURL(emailUrl).then((supported) => {
      if (supported) {
        Linking.openURL(emailUrl);
      } else {
        Alert.alert("Error", "Cannot open email client");
      }
    });
  };

  const handleTikTok = () => {
    const tiktokUrl = "https://tiktok.com/@your_handle";
    Linking.canOpenURL(tiktokUrl).then((supported) => {
      if (supported) {
        Linking.openURL(tiktokUrl);
      } else {
        Alert.alert("Error", "Cannot open TikTok");
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Contact Us" backgroundColor="#EFF1F3" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Options */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon={<FontAwesome5 name="instagram" size={20} color="#666" />}
            title="Instagram"
            onPress={handleInstagram}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<Feather name="mail" size={20} color="#666" />}
            title="Email"
            onPress={handleEmail}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<FontAwesome5 name="tiktok" size={20} color="#666" />}
            title="Tik tok"
            onPress={handleTikTok}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF1F3",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  menuContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});

export default ContactUs;
