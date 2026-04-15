import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CustomGradientButton from '../../src/components/CustomGradientButton';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { changePassword } = useAuth();

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await changePassword({
                currentPassword,
                newPassword
            });
            
            if (response.success) {
                Alert.alert(
                    "Password Changed", 
                    "Your password has been successfully changed!",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/login")
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Password Change Failed", 
                    response.error?.title || "Failed to change password"
                );
            }
        } catch (error) {
            console.log('Change password error:', error);
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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#990009" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Current Password Field */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showCurrent}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Ionicons name={showCurrent ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password Field */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showNew}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password Field */}
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showConfirm}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Save Changes Button */}
                    <View style={styles.buttonContainer}>
                        <CustomGradientButton
                            title="Save Changes"
                            onPress={handleChangePassword}
                            isLoading={isLoading}
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
    inputSection: {
        marginBottom: 20,
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
        fontSize: 14,
        color: "#333"
    },
    buttonContainer: {
        marginTop: 20,
    }
});