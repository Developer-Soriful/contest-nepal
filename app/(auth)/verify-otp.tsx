import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
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

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams<{ email?: string }>();
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);

    const { verifyOtp, forgotPassword } = useAuth();

    // Validate and format the contact info
    const getContactDisplay = () => {
        if (!email) return "your email";
        
        // Check if it's an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            return email;
        }
        
        // If it's a phone number, format it
        const phoneRegex = /^\d+$/;
        if (phoneRegex.test(email.replace(/\D/g, ''))) {
            return email;
        }
        
        // Default fallback
        return email;
    };

    const isEmail = () => {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto focus next input
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace to go to previous input
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = code.join('');
        
        if (otpCode.length !== 6) {
            Alert.alert("Error", "Please enter all 6 digits");
            return;
        }

        if (!email) {
            Alert.alert("Error", "Email not found. Please try again.");
            return;
        }

        setIsLoading(true);

        try {
            console.log('[VerifyOTP] Verifying OTP for:', email, 'Code:', otpCode);
            const response = await verifyOtp(email, otpCode);

            if (response.success) {
                console.log('[VerifyOTP] OTP verified successfully');
                // Navigate to reset password with the email
                router.push({
                    pathname: "/reset-password",
                    params: { email, otp: otpCode }
                });
            } else {
                Alert.alert(
                    "Invalid Code",
                    response.error?.title || "The code you entered is incorrect. Please try again."
                );
            }
        } catch (error) {
            console.log('[VerifyOTP] Error:', error);
            Alert.alert("Error", "Failed to verify code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            Alert.alert("Error", "Email not found. Please try again.");
            return;
        }

        try {
            console.log('[VerifyOTP] Resending OTP to:', email);
            const response = await forgotPassword(email);
            
            if (response.success) {
                // Clear current OTP inputs
                setCode(["", "", "", "", "", ""]);
                // Focus first input
                inputs.current[0]?.focus();
                
                Alert.alert(
                    "Code Resent", 
                    "A new 6-digit code has been sent to your email.",
                    [{ text: "OK" }]
                );
            } else {
                Alert.alert(
                    "Resend Failed",
                    response.error?.title || "Failed to resend code. Please try again."
                );
            }
        } catch (error) {
            console.log('[VerifyOTP] Resend error:', error);
            Alert.alert("Error", "Failed to resend code. Please try again.");
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
                    <Text style={styles.headerTitle}>Verify Code</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.mainTitle}>Enter Verification Code</Text>
                        <Text style={styles.subTitle}>
                            We've sent a 6-digit code to {isEmail() ? "your email" : "your phone number"}
                        </Text>
                        <Text style={styles.contactText}>
                            {getContactDisplay()}
                        </Text>
                    </View>

                    {/* OTP Input Section */}
                    <View style={styles.otpContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => {
                                    inputs.current[index] = el;
                                }}
                                style={styles.otpBox}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Resend Section */}
                    <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive code? </Text>
                        <Text style={styles.resendLink}>Resend</Text>
                    </TouchableOpacity>

                    {/* Button Section */}
                    <View style={styles.buttonContainer}>
                        <CustomGradientButton
                            title={isLoading ? "Verifying..." : "Verify Code"}
                            onPress={handleVerify}
                            disabled={isLoading || code.join('').length !== 6}
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
    contactText: {
        fontSize: 16,
        color: "#1a1a2e",
        fontWeight: "bold",
        marginTop: 4,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    otpBox: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 12,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a2e",
    },
    resendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    resendText: {
        fontSize: 14,
        color: "#666",
    },
    resendLink: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#990009",
    },
    buttonContainer: {
        marginTop: 10,
    },
});
