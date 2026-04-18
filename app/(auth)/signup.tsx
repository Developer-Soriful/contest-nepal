import { import_img } from "@/assets/import_img";
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
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomGradientButton from '../../src/components/CustomGradientButton';
import { useAuth } from '../../src/contexts/AuthContext';
import useGoogleAuth from '../../src/hooks/useGoogleAuth';

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, socialLogin, isLoading: authLoading } = useAuth();
  const { signIn: googleSignIn, isLoading: googleLoading } = useGoogleAuth();

  const handleGoogleSignup = async () => {
    try {
      const { token, error } = await googleSignIn();
      
      if (error) {
        Alert.alert('Google Signup Failed', error.message);
        return;
      }

      if (token) {
        const response = await socialLogin('google', token);
        
        if (response.success) {
          router.replace('/(tabs)' as any);
        } else {
          Alert.alert(
            'Signup Failed',
            response.error?.title || 'Google signup failed. Please try again.'
          );
        }
      }
    } catch (error) {
      console.log('Google signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred during Google signup.');
    }
  };

  const handleSignup = async () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    
    if (!acceptTerms) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await register({
        email: email.trim(),
        password,
        displayName: name.trim(),
        role: 'participant', 
      });
      
      if (response.success) {
        Alert.alert(
          "Registration Successful", 
          "Please check your email for verification instructions.",
          [
            {
              text: "OK",
              onPress: () => router.replace({
                pathname: "/verify-email",
                params: { email: email.trim() }
              })
            }
          ]
        );
      } else {
        Alert.alert(
          "Registration Failed", 
          response.error?.title || "An error occurred during registration"
        );
      }
    } catch (error) {
      console.log("Registration error:", error);
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

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Enter your Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#aaa"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Enter your Email or phone number</Text>
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
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Enter your Password</Text>
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

            {/* Terms & Conditions */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 25,
                paddingHorizontal: 5,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: acceptTerms ? "#990009" : "transparent",
                    },
                  ]}
                >
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <Text style={{ fontSize: 12, color: "#6c757d" }}>
                  Accept Terms & Conditions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <View style={{ marginBottom: 25 }}>
              <CustomGradientButton
                title={isLoading || authLoading ? "Creating Account..." : "Sign Up"}
                onPress={handleSignup}
                disabled={isLoading || authLoading}
              />
            </View>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 25,
              }}
            >
              <View style={styles.line} />
              <Text style={styles.orText}>Or Continue With</Text>
              <View style={styles.line} />
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
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleSignup}
                disabled={googleLoading || authLoading}
              >
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                  }}
                  style={{ width: 22, height: 22 }}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={22} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={{ fontSize: 13, color: "#666" }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.navigate("/login")}>
                <Text
                  style={{ fontSize: 13, fontWeight: "bold", color: "#000" }}
                >
                  Log In
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
  formContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderLeftWidth: 0.1,
    borderRightWidth: 0.1,
    borderColor: "#990009",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
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
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#990009",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  buttonShadow: {
    height: 55,
    shadowColor: "#a10a11",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  orText: {
    marginHorizontal: 15,
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
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
    elevation: 2,
  },
});
