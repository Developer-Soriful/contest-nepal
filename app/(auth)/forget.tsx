import CustomGradientButton from '@/src/components/CustomGradientButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
    const [emailOrPhone, setEmailOrPhone] = useState("");

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

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                                placeholder="E-mail address or phone number"
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
                            title="Send Reset Code"
                            onPress={() => router.navigate("/(auth)/verify-email")}
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
                        <TouchableOpacity style={{ marginTop: 15 }}>
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
        paddingLeft: 5
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 34,
        paddingHorizontal: 20,
        height: 56,
        backgroundColor: "#fff"
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: "#333"
    },
    buttonContainer: {
        marginTop: 10,
    },
    footer: {
        alignItems: "center",
        marginTop: 40,
        paddingBottom: 20
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
    }
});