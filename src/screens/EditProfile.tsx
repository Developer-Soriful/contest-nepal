import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
}

interface ProfileData extends FormData {
    avatarUri: string | null;
}

const EditProfile = () => {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<FormData>>({});

    // Default avatar - in real app, fetch from API or context
    const defaultAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';

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

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            // Prepare complete profile data for API
            const profileData: ProfileData = {
                ...formData,
                avatarUri: selectedImage,
            };

            // TODO: API call to save profile
            // Example API integration:
            // const formData = new FormData();
            // formData.append('fullName', profileData.fullName);
            // formData.append('email', profileData.email);
            // formData.append('phone', profileData.phone);
            // if (selectedImage) {
            //     formData.append('avatar', {
            //         uri: selectedImage,
            //         type: 'image/jpeg',
            //         name: 'avatar.jpg',
            //     });
            // }
            // await api.uploadProfile(formData);

            console.log('Saving profile:', profileData);
            Alert.alert(
                'Success',
                'Profile updated successfully!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    };

    const handleAvatarPress = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library to change your avatar.');
            return;
        }

        // Open image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
                            <Image
                                source={{ uri: selectedImage || defaultAvatar }}
                                style={styles.avatar}
                            />
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

                        {/* Email Address */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>E-mail address</Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Enter your e-mail address"
                                placeholderTextColor="#999"
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}
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
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#990009',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    formContainer: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#333',
        borderWidth: 1,
        borderColor: '#BFBBFF',
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
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 30,
        borderWidth: 1,
        borderColor: '#990009',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditProfile;
