import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomGradientButton from '../../src/components/CustomGradientButton';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ResetPasswordScreen() {
    const { email, otp } = useLocalSearchParams<{ email?: string; otp?: string }>();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { resetPassword } = useAuth();

    const handleResetPassword = async () => {
        if (!newPassword.trim()) {
            Alert.alert("Error", "Please enter a new password");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (!otp) {
            Alert.alert("Error", "Verification code not found. Please try again.");
            return;
        }

        setIsLoading(true);

        try {
            console.log('[ResetPassword] Resetting password with OTP:', otp, 'Email:', email);
            // Pass email and otp for OTP-based reset flow
            const response = await resetPassword(otp, newPassword, email, otp);

            if (response.success) {
                console.log('[ResetPassword] Password reset successful');
                Alert.alert(
                    "Password Reset Successful",
                    "Your password has been reset successfully. Please log in with your new password.",
                    [
                        {
                            text: "Login",
                            onPress: () => router.navigate("/login")
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Failed to Reset Password",
                    response.error?.title || "An error occurred. Please try again."
                );
            }
        } catch (error) {
            console.log('[ResetPassword] Error:', error);
            Alert.alert("Error", "Failed to reset password. Please try again.");
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
                    <Text style={styles.headerTitle}>Reset Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.mainTitle}>Create New Password</Text>
                        <Text style={styles.subTitle}>
                            Enter your new password below. Make sure it's strong and secure.
                        </Text>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#888" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                placeholderTextColor="#aaa"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#888" />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm new password"
                                placeholderTextColor="#aaa"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Password Requirements */}
                    <View style={styles.requirementsContainer}>
                        <Text style={styles.requirementsTitle}>Password must:</Text>
                        <Text style={styles.requirementItem}>• Be at least 6 characters</Text>
                        <Text style={styles.requirementItem}>• Include uppercase and lowercase letters</Text>
                        <Text style={styles.requirementItem}>• Include at least one number</Text>
                    </View>

                    {/* Button Section */}
                    <View style={styles.buttonContainer}>
                        <CustomGradientButton
                            title={isLoading ? "Resetting..." : "Reset Password"}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        />
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
        marginBottom: 20,
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
    requirementsContainer: {
        marginTop: 10,
        marginBottom: 30,
        paddingHorizontal: 5,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    requirementItem: {
        fontSize: 13,
        color: "#666",
        marginBottom: 4,
    },
    buttonContainer: {
        marginTop: 10,
    },
});
