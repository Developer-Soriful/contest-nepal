import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

// API Integration
import { import_img } from '@/assets/import_img';
import { AUTH_EVENTS, useAuth } from '@/src/contexts/AuthContext';
import SafeAsyncStorage from '@/src/lib/SafeAsyncStorage';
import { authApi } from '@/src/services/api';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
}

interface ProfileData extends FormData {
    avatarUri: string | null;
}

const EditProfile = () => {
    const { user, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const avatarUri = selectedImage ?? user?.profile?.avatarUrl ?? undefined;

    // Load user data from AuthContext on mount
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.profile?.displayName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    // Reload user data when screen is focused (e.g., after navigating back)
    useFocusEffect(
        useCallback(() => {
            console.log('EditProfile - Screen focused, reloading user data');
            setAvatarError(false); // Reset avatar error
            if (user) {
                setFormData({
                    fullName: user.profile?.displayName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                });
            }
        }, [user])
    );

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        // Email is read-only from AuthContext, no validation needed

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            let avatarUrl: string | undefined;
            
            // Upload avatar if changed
            if (selectedImage) {
                const avatarResponse = await authApi.uploadAvatar(selectedImage);
                if (!avatarResponse.success) {
                    Alert.alert('Error', avatarResponse.error?.title || 'Failed to upload avatar');
                    setIsSaving(false);
                    return;
                }
                // Capture the avatarUrl from upload response
                avatarUrl = avatarResponse.data?.avatarUrl;
            }

            // Update profile (with avatarUrl if uploaded)
            const profileResponse = await authApi.updateProfile({
                displayName: formData.fullName,
                phone: formData.phone,
                avatarUrl, 
            });

            if (profileResponse.success && profileResponse.data) {
                // Clear selected image after successful upload
                setSelectedImage(null);
                
                // Update stored user data FIRST
                await SafeAsyncStorage.setItem('user_data', JSON.stringify(profileResponse.data));
                
                // Force refresh user context BEFORE navigation
                await refreshUser();
                
                // Broadcast to all screens that user data has been updated
                DeviceEventEmitter.emit(AUTH_EVENTS.USER_UPDATED, profileResponse.data);
                console.log('[EditProfile] Broadcast USER_UPDATED event');
                
                // Small delay to ensure state propagates
                await new Promise(resolve => setTimeout(resolve, 300));
                
                Alert.alert(
                    'Success',
                    'Profile updated successfully!',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', profileResponse.error?.title || 'Failed to update profile');
            }
        } catch (error) {
            console.log('Save error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarPress = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library to change your avatar.');
            return;
        }

        // Load user data from AuthContext
        if (user) {
            setFormData({
                fullName: user.profile?.displayName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }

        // Open image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], 
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Edit Profile"
                backgroundColor="#EFF1F3"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {avatarUri && !avatarError ? (
                                <Image
                                    key={avatarUri} // Force re-render when avatar changes
                                    source={{
                                        uri: avatarUri
                                    }}
                                    style={styles.avatar}
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <Image
                                    source={import_img.user_avatar}
                                    style={styles.avatar}
                                />
                            )}
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handleAvatarPress}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="camera" size={14} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={[styles.input, errors.fullName && styles.inputError]}
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                                value={formData.fullName}
                                onChangeText={(text) => handleInputChange('fullName', text)}
                                autoCapitalize="words"
                            />
                            {errors.fullName && (
                                <Text style={styles.errorText}>{errors.fullName}</Text>
                            )}
                        </View>

                        {/* Email Address - Read Only */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-mail address</Text>
                            <TextInput
                                style={[styles.input, styles.readOnlyInput]}
                                value={formData.email}
                                editable={false}
                                selectTextOnFocus={false}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Text style={styles.helperText}>Email cannot be changed</Text>
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone number</Text>
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#999"
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                                keyboardType="phone-pad"
                            />
                            {errors.phone && (
                                <Text style={styles.errorText}>{errors.phone}</Text>
                            )}
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF1F3',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#990009',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#FFF',
    },
    readOnlyInput: {
        backgroundColor: '#F0F0F0',
        color: '#666',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 4,
    },
    inputError: {
        borderColor: '#FF4444',
    },
    errorText: {
        fontSize: 12,
        color: '#FF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#990009',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default EditProfile;
