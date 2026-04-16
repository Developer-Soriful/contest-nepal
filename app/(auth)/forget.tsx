import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomGradientButton from '../../src/components/CustomGradientButton';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword } = useAuth();

  const handleForgotPassword = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert("Error", "Please enter your email or phone number");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await forgotPassword(emailOrPhone.trim());
      
      if (response.success) {
        Alert.alert(
          "Reset Email Sent",
          "We've sent a 6-digit verification code to your email. Please check and enter it on the next screen.",
          [
            {
              text: "Continue",
              onPress: () => {
                router.push({
                  pathname: "/verify-otp",
                  params: { email: emailOrPhone.trim() }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Failed to Send Reset Email", 
          response.error?.title || "An error occurred while sending reset email"
        );
      }
    } catch (error) {
      console.log("Forgot password error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#990009" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Forgot Password?</Text>
            <Text style={styles.subTitle}>
              Don't worry! Enter your registered email or phone number.
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Enter your email or phone number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Email or phone number"
                placeholderTextColor="#aaa"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Button Section */}
          <View style={styles.buttonContainer}>
            <CustomGradientButton
              title={isLoading ? "Sending..." : "Send Reset Code"}
              onPress={handleForgotPassword}
              disabled={isLoading}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remembered your password? </Text>
              <TouchableOpacity onPress={() => router.navigate("/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ marginTop: 15 }}
              onPress={() => router.push("/help-support")}
              activeOpacity={0.8}
            >
              <Text style={styles.needHelpText}>Need Help?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#990009",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  titleSection: {
    marginVertical: 30,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
    paddingLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 34,
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 10,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 20,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  needHelpText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
