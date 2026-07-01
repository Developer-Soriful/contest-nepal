import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";
import SafeAsyncStorage from "../lib/SafeAsyncStorage";

const COLORS = {
  primary: "#990000",
  primaryDark: "#7A0000",
  primaryLight: "#D40000",
  bg: "#FFFFFF",
  textDark: "#1F2937",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  inputBg: "#F9FAFB",
  errorBg: "#FEF2F2",
  errorText: "#DC2626",
  errorBorder: "#FECACA",
  warningBg: "#FFFBEB",
  warningText: "#92400E",
  warningBorder: "#FDE68A",
};

const Verify2FAScreen = () => {
  const params = useLocalSearchParams();
  const { refreshUser } = useAuth();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get tempToken from params or AsyncStorage
  useEffect(() => {
    const token = params.tempToken as string | undefined;
    const userEmail = params.email as string | undefined;

    if (token) {
      setTempToken(token);
      setEmail(userEmail || null);
      SafeAsyncStorage.setItem("2fa_temp_token", token);
      if (userEmail) SafeAsyncStorage.setItem("2fa_email", userEmail);
    } else {
      // Fallback from storage
      (async () => {
        const storedToken = await SafeAsyncStorage.getItem("2fa_temp_token");
        const storedEmail = await SafeAsyncStorage.getItem("2fa_email");
        if (storedToken) {
          setTempToken(storedToken);
          setEmail(storedEmail);
        } else {
          setError("Invalid or expired session");
          setTimeout(() => router.replace("/(auth)/login"), 2000);
        }
      })();
    }
  }, [params]);

  const handleCodeChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeStr?: string) => {
    Keyboard.dismiss();
    const fullCode = codeStr || code.join("");

    if (fullCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    if (!tempToken) {
      setError("Invalid session. Please login again.");
      setTimeout(() => router.replace("/(auth)/login"), 2000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.verify2FA({
        tempToken,
        code: fullCode.trim(),
      });

      if (response.success && response.data) {
        // Clean up
        await SafeAsyncStorage.removeItem("2fa_temp_token");
        await SafeAsyncStorage.removeItem("2fa_email");

        // Refresh user in auth context
        await refreshUser();

        // Navigate to main app
        router.replace("/(tabs)");
      } else {
        setError(response.error?.title || "Invalid verification code");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await SafeAsyncStorage.removeItem("2fa_temp_token");
    await SafeAsyncStorage.removeItem("2fa_email");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>

          {/* Shield Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              style={styles.iconGradient}
            >
              <Ionicons name="shield-checkmark" size={36} color="#fff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code from your authenticator app
          </Text>
          {email && (
            <Text style={styles.emailText}>for {email}</Text>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.errorText} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Code Inputs */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                  error ? styles.codeInputError : null,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!isLoading}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text style={styles.expiryText}>Code expires in 30 seconds</Text>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isLoading || code.some((d) => !d)) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={isLoading || code.some((d) => !d)}
          >
            <LinearGradient
              colors={
                isLoading || code.some((d) => !d)
                  ? ["#ccc", "#bbb"]
                  : [COLORS.primary, COLORS.primaryLight]
              }
              style={styles.verifyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={16} color={COLORS.textMuted} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Lost access to your authenticator?</Text>
            <Text style={styles.infoDesc}>
              Use one of your backup codes or contact support.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
  },
  iconContainer: { marginBottom: 24 },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    alignSelf: "stretch",
  },
  errorText: { fontSize: 13, color: COLORS.errorText, flex: 1 },
  codeContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 32,
    marginBottom: 8,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: COLORS.textDark,
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF5F5",
  },
  codeInputError: {
    borderColor: COLORS.errorText,
  },
  expiryText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 28,
  },
  verifyButton: { alignSelf: "stretch", borderRadius: 14, overflow: "hidden" },
  verifyButtonDisabled: { opacity: 0.7 },
  verifyGradient: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  infoBox: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "stretch",
    marginTop: 28,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.warningText,
    textAlign: "center",
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: COLORS.warningText,
    textAlign: "center",
  },
});

export default Verify2FAScreen;
