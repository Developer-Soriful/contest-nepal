import CustomGradientButton from '@/src/components/CustomGradientButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmail() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);

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
                            We've sent a 6-digit code to j***@gmail.com
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
                            title="Verify"
                            onPress={() => router.navigate("/change-password")}
                        />
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Didn't receive the code? </Text>
                            <TouchableOpacity onPress={() => console.log("Resend code")}>
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