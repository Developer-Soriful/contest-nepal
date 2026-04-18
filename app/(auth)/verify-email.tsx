import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomGradientButton from '../../src/components/CustomGradientButton';
import { useAuth } from '../../src/contexts/AuthContext';
import SafeAsyncStorage from '../../src/lib/SafeAsyncStorage';

export default function VerifyEmail() {
    const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);
    
    const { verifyEmail, resendVerificationEmail } = useAuth();

    // Initialize email from navigation params or storage
    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        } else {
            // Try to get email from storage (for cases where user navigates directly)
            const getEmailFromStorage = async () => {
                try {
                    const userData = await SafeAsyncStorage.getItem('user_data');
                    if (userData) {
                        const user = JSON.parse(userData);
                        if (user.email) {
                            setEmail(user.email);
                        }
                    }
                } catch (error) {
                    console.log('Error getting email from storage:', error);
                }
            };
            getEmailFromStorage();
        }
    }, [emailParam]);

    // Format email for display (mask for privacy)
    const formatEmailForDisplay = (email: string) => {
        if (!email || !email.includes('@')) return email;
        
        const [username, domain] = email.split('@');
        if (username.length <= 2) {
            return `${username[0]}***@${domain}`;
        }
        
        const maskedUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        
        if (fullCode.length !== 6) {
            Alert.alert("Error", "Please enter the complete 6-digit verification code");
            return;
        }
        
        if (!email.trim()) {
            Alert.alert("Error", "Email is required for verification");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await verifyEmail({
                email: email.trim(),
                code: fullCode
            });
            
            if (response.success) {
                Alert.alert(
                    "Email Verified", 
                    "Your email has been successfully verified!",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/login")
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Verification Failed", 
                    response.error?.title || "Invalid verification code"
                );
            }
        } catch (error) {
            console.log("Email verification error:", error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInput = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#990009" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Back to Login</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Shield Icon Section */}
                    <View style={styles.iconContainer}>
                        <View style={styles.shieldCircle}>
                            <Ionicons name="shield-checkmark" size={40} color="white" />
                        </View>
                    </View>

                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.mainTitle}>Enter Verification Code</Text>
                        <Text style={styles.subTitle}>
                            We've sent a 6-digit code to your email
                        </Text>
                        <Text style={styles.emailDisplay}>
                            {formatEmailForDisplay(email) || 'your email'}
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
                                onChangeText={(text) => handleInput(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                        ))}
                    </View>

                    <TouchableOpacity style={styles.pasteButton}>
                        <Text style={styles.pasteText}>Paste Code</Text>
                    </TouchableOpacity>

                    {/* Verify Button */}
                    <View style={styles.buttonContainer}>
                        <CustomGradientButton
                            title={isLoading ? "Verifying..." : "Verify"}
                            onPress={handleVerify}
                            disabled={isLoading}
                        />
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Didn't receive the code? </Text>
                            <TouchableOpacity onPress={() => resendVerificationEmail(email)}>
                                <Text style={styles.resendLink}>Resend</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.navigate("/login")}
                            style={{ marginTop: 15 }}
                        >
                            <Text style={styles.backToLoginText}>Back to Login</Text>
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
        alignItems: "center",
    },
    iconContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    shieldCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#990009",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    titleSection: {
        alignItems: "center",
        marginBottom: 30,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 14,
        color: "#6c757d",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    emailDisplay: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a2e",
        marginTop: 4,
        textAlign: "center",
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
        borderColor: "#990009",
        borderRadius: 8,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        backgroundColor: "#fff",
    },
    pasteButton: {
        marginBottom: 30,
    },
    pasteText: {
        color: "#1a1a2e",
        fontWeight: "bold",
        fontSize: 16,
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 30,
    },
    footer: {
        alignItems: "center",
        width: "100%",
        paddingBottom: 30,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: "#666",
    },
    resendLink: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    backToLoginText: {
        fontSize: 14,
        color: "#666",
        textDecorationLine: "none",
    }
});