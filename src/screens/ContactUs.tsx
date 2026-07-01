import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import CustomGradientButton from "../components/CustomGradientButton";

const COLORS = {
  primary: "#990000",
  bgLight: "#F9FAFB",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmail = () => {
    Linking.openURL("mailto:admin@contestnepal.com");
  };

  const handleTikTok = () => {
    Linking.openURL("https://www.tiktok.com/@contestnepal");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/447404257825");
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("Required Fields", "Please fill out all fields before sending your message.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Message Sent", "Thank you for reaching out! We will get back to you shortly.");
      setName("");
      setEmail("");
      setMessage("");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Contact Us" backgroundColor={COLORS.bgLight} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Information */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Get in Touch</Text>
          <Text style={styles.subtitle}>
            Have a question, feedback, or need help? Send us a message or connect via our social channels.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="How can we help you?"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <CustomGradientButton
            title={isSubmitting ? "Sending..." : "Send Message"}
            onPress={handleSubmit}
            disabled={isSubmitting}
            containerStyle={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.dividerLarge} />

        <Text style={styles.socialTitle}>Other Ways to Connect</Text>
        
        {/* Social Links */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon={<Feather name="mail" size={20} color="#666" />}
            title="Email Support"
            onPress={handleEmail}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<FontAwesome5 name="tiktok" size={20} color="#666" />}
            title="Follow us on TikTok"
            onPress={handleTikTok}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={<FontAwesome5 name="whatsapp" size={20} color="#666" />}
            title="Chat on WhatsApp"
            onPress={handleWhatsApp}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 16,
    backgroundColor: COLORS.bgLight,
  },
  textArea: {
    minHeight: 100,
  },
  dividerLarge: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});

export default ContactUs;
