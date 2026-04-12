import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { import_img } from '../../assets/import_img';
import CustomGradientButton from '../../src/components/CustomGradientButton';
import { useAuth } from '../../src/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isLoading: authLoading } = useAuth();

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email or phone number");
      return;
    }
    
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await login(email.trim(), password);
      
      if (response.success) {
        // Login successful, navigate to tabs
        router.replace("/(tabs)" as any);
      } else {
        // Show error message
        Alert.alert(
          "Login Failed", 
          response.error?.title || "An error occurred during login"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Logo Section */}
          <View
            style={{
              height: 220,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={import_img.icon}
              style={{ width: 160, height: 160 }}
              resizeMode="contain"
            />
          </View>

          {/* Bottom Form Container */}
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderTopLeftRadius: 34,
              borderTopRightRadius: 34,
              paddingHorizontal: 18,
              paddingTop: 40,
              paddingBottom: 40,
              borderTopWidth: 1,
              borderLeftWidth: 0.1,
              borderRightWidth: 0.1,
              borderColor: "#990009",
            }}
          >
            {/* Email Field */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8,
                  paddingLeft: 5,
                }}
              >
                Enter your Email or Phone Number
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Email or phone number"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: 8,
                  paddingLeft: 5,
                }}
              >
                Password
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 5 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 30,
                paddingHorizontal: 5,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                {/* Custom Radio/Checkbox */}
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: rememberMe ? "#6c757d" : "#6c757d",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 6,
                  }}
                >
                  {rememberMe && (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#6c757d",
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 12, color: "#6c757d" }}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.navigate("/forget")}>
                <Text
                  style={{ fontSize: 12, color: "#ff6d6d", fontWeight: "500" }}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <CustomGradientButton 
              title={isLoading || authLoading ? "Logging in..." : "Login"} 
              onPress={handleLogin}
              disabled={isLoading || authLoading}
            />
            {/* Or Continue With */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 25,
                marginTop: 25,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#e0e0e0" }}
              />
              <Text
                style={{
                  marginHorizontal: 15,
                  fontSize: 12,
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                Or Continue With
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#e0e0e0" }}
              />
            </View>

            {/* Social Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 15,
                marginBottom: 35,
              }}
            >
              {/* Google */}
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                  }}
                  style={{ width: 22, height: 22 }}
                />
              </TouchableOpacity>
              {/* Apple */}
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={22} color="black" />
              </TouchableOpacity>
              {/* Facebook */}
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
            </View>

            {/* Don't have an account? */}
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={{ fontSize: 13, color: "#666" }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.navigate("/signup")}>
                <Text
                  style={{ fontSize: 13, fontWeight: "bold", color: "#000" }}
                >
                  Create account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 34,
    paddingHorizontal: 20,
    height: 56,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#eaeaea",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
