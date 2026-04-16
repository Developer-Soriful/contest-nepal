import CustomGradientButton from '@/src/components/CustomGradientButton';
import Header from '@/src/components/Header';
import { authApi } from '@/src/services/api';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants for Maintenance ---
const COLORS = {
    headerBg: '#FF92991F',
    primaryRed: '#990000',
    buttonGradient: ['#990000', '#D40000'] as const,
    textDark: '#1F2937',
    textSecondary: '#4F586D',
    borderLight: '#E5E7EB',
    taskIconBg: '#EEF2FF',
    uploadBorder: '#9CA3AF',
    bgLight: '#FFFFFF',
};

// Task interface from backend
interface Task {
    id: string;
    taskType: string;
    label: string;
    required: boolean;
    completed?: boolean;
}

interface Contest {
    id: string;
    title: string;
    reward: string;
    description?: string;
    rules?: string;
    tasks?: Task[];
}

export default function EntryFormScreen() {
    const { contestId } = useLocalSearchParams<{ contestId: string }>();

    const [contest, setContest] = useState<Contest | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [bodyText, setBodyText] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Fetch contest with tasks on mount
    useEffect(() => {
        if (!contestId) {
            setError('No contest ID provided');
            setLoading(false);
            return;
        }

        fetchContestWithTasks();
    }, [contestId]);

    const fetchContestWithTasks = async () => {
        try {
            setLoading(true);
            console.log('[EntryForm] Fetching contest:', contestId);

            const response = await authApi.getContestById(contestId as string);

            if (response.success && response.data) {
                console.log('[EntryForm] Contest loaded:', response.data.title);
                setContest(response.data);
                // Add completed field to tasks if they exist
                const contestTasks = (response.data as any).tasks || [];
                setTasks(contestTasks.map((t: any) => ({ ...t, completed: false })));
            } else {
                console.log('[EntryForm] Failed to load:', response.error);
                setError(response.error?.title || 'Failed to load contest');
            }
        } catch (err) {
            console.log('[EntryForm] Error:', err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleSubmit = async () => {
        // Validate required tasks
        const requiredTasks = tasks.filter(t => t.required);
        const completedRequiredTasks = requiredTasks.filter(t => t.completed ?? false);

        if (completedRequiredTasks.length < requiredTasks.length) {
            Alert.alert('Error', `Please complete all ${requiredTasks.length} required tasks`);
            return;
        }

        try {
            setSubmitting(true);
            console.log('[EntryForm] Submitting entry for contest:', contestId);

            // Build submission data - only include taskCompletions if tasks exist
            const submissionData: any = {
                bodyText: bodyText.trim() || undefined,
                mediaUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
            };

            // Only add taskCompletions if there are tasks
            if (tasks.length > 0) {
                submissionData.taskCompletions = tasks.map(t => ({
                    taskId: t.id,
                    completed: t.completed ?? false,
                }));
            }

            const response = await authApi.createSubmission(contestId as string, submissionData);

            if (response.success) {
                console.log('[EntryForm] Entry submitted successfully');
                Alert.alert('Success', 'Your entry has been submitted!', [
                    { text: 'OK', onPress: () => router.replace('/entry-confirm') }
                ]);
            } else {
                console.log('[EntryForm] Submit failed:', response.error);
                Alert.alert('Error', response.error?.title || 'Failed to submit entry');
            }
        } catch (err) {
            console.log('[EntryForm] Submit error:', err);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle file upload
    const handleFileUpload = async () => {
        try {
            // Check if user is logged in
            const { accessToken } = await authApi.getTokens();
            if (!accessToken) {
                Alert.alert('Login Required', 'Please login to upload images.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/login') }
                ]);
                return;
            }

            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to photos to upload screenshots.');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const imageUri = result.assets[0].uri;
            console.log('[EntryForm] Selected image:', imageUri);

            // Upload image
            setUploading(true);
            console.log('[EntryForm] Uploading image...');

            const uploadResponse = await authApi.uploadAvatar(imageUri);

            if (uploadResponse.success && uploadResponse.data?.avatarUrl) {
                console.log('[EntryForm] Image uploaded:', uploadResponse.data.avatarUrl);
                setUploadedImages(prev => [...prev, uploadResponse.data!.avatarUrl]);
                Alert.alert('Success', 'Image uploaded successfully!');
            } else {
                console.log('[EntryForm] Upload failed:', uploadResponse.error);
                Alert.alert('Upload Failed', uploadResponse.error?.title || 'Failed to upload image. Please try again.');
            }
        } catch (err) {
            console.log('[EntryForm] Upload error:', err);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Remove uploaded image
    const handleRemoveImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Get icon based on task type
    const getTaskIcon = (taskType: string) => {
        switch (taskType.toLowerCase()) {
            case 'twitter':
            case 'x':
            case 'tweet':
                return <FontAwesome name="twitter" size={18} color={COLORS.primaryRed} />;
            case 'email':
            case 'newsletter':
            case 'subscribe':
                return <MaterialCommunityIcons name="email-outline" size={18} color={COLORS.primaryRed} />;
            case 'facebook':
                return <FontAwesome name="facebook" size={18} color={COLORS.primaryRed} />;
            case 'instagram':
                return <FontAwesome name="instagram" size={18} color={COLORS.primaryRed} />;
            case 'youtube':
                return <FontAwesome name="youtube" size={18} color={COLORS.primaryRed} />;
            default:
                return <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primaryRed} />;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primaryRed} />
                <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading contest...</Text>
            </SafeAreaView>
        );
    }

    if (error || !contest) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
                    {error || 'Contest not found'}
                </Text>
                <TouchableOpacity onPress={fetchContestWithTasks} style={{ marginTop: 16 }}>
                    <Text style={{ color: COLORS.primaryRed, fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgLight }}>
            <Header
                title="Entry Form"
                backgroundColor="transparent"
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={{ marginHorizontal: 16, borderRadius: 24 }}>
                    {/* Header Section */}
                    <View style={{
                        backgroundColor: COLORS.headerBg,
                        paddingVertical: 30,
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        width: '100%',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24
                    }}>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: '500',
                            color: '#222e48',
                            marginBottom: 8
                        }}>
                            Enter Giveaway
                        </Text>
                        <Text style={{
                            textAlign: 'center',
                            fontSize: 14,
                            color: COLORS.textSecondary,
                            lineHeight: 20,
                            fontWeight: 500
                        }}>
                            Complete the tasks below to earn your entry for{' '}
                            <Text style={{ color: COLORS.primaryRed }}>
                                Weekly Gift Card Drop.
                            </Text>
                        </Text>
                    </View>
                    <View style={{ padding: 12, borderWidth: 1, borderColor: '#E9E9E9', borderEndEndRadius: 24, borderBottomLeftRadius: 24 }}>
                        {/* Required Tasks Section */}
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
                                Required Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})
                            </Text>

                            {/* Dynamic Tasks from Backend */}
                            {tasks.length === 0 ? (
                                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                                    No tasks required for this contest.
                                </Text>
                            ) : (
                                tasks.map((task, index) => (
                                    <TouchableOpacity
                                        key={task.id}
                                        activeOpacity={0.8}
                                        onPress={() => toggleTask(task.id)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: 16,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: COLORS.borderLight,
                                            marginBottom: index === tasks.length - 1 ? 24 : 12,
                                        }}
                                    >
                                        <View style={{
                                            width: 40, height: 40, borderRadius: 20,
                                            backgroundColor: COLORS.taskIconBg,
                                            alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {getTaskIcon(task.taskType)}
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={{ fontWeight: '600', color: '#1F2937' }}>
                                                {task.label}
                                                {task.required && <Text style={{ color: COLORS.primaryRed }}> *</Text>}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                                                {task.required ? 'Required' : 'Optional'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            width: 24, height: 24, borderRadius: 12,
                                            borderWidth: 2, borderColor: COLORS.borderLight,
                                            alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: task.completed ? COLORS.primaryRed : 'transparent'
                                        }}>
                                            {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}

                            {/* Entry Message (Optional) */}
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8, marginTop: 8 }}>
                                Entry Message (Optional)
                            </Text>
                            <TextInput
                                value={bodyText}
                                onChangeText={setBodyText}
                                placeholder="Enter your message or submission details..."
                                multiline
                                numberOfLines={4}
                                style={{
                                    borderWidth: 1,
                                    borderColor: COLORS.borderLight,
                                    borderRadius: 12,
                                    padding: 12,
                                    fontSize: 14,
                                    color: COLORS.textDark,
                                    textAlignVertical: 'top',
                                    minHeight: 100,
                                    marginBottom: 16,
                                }}
                            />

                            {/* Upload Screenshot Section */}
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
                                Upload Screenshot (Optional)
                            </Text>

                            {/* Uploaded Images Preview */}
                            {uploadedImages.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                                    {uploadedImages.map((uri, index) => (
                                        <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                                            <Image
                                                source={{ uri }}
                                                style={{ width: 80, height: 80, borderRadius: 8 }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => handleRemoveImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: -5,
                                                    right: -5,
                                                    backgroundColor: COLORS.primaryRed,
                                                    borderRadius: 10,
                                                    width: 20,
                                                    height: 20,
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Ionicons name="close" size={14} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={handleFileUpload}
                                disabled={uploading}
                                style={{
                                    height: 160,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: COLORS.uploadBorder,
                                    borderStyle: 'dashed',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: uploading ? '#F3F4F6' : '#FAFAFA'
                                }}
                            >
                                {uploading ? (
                                    <ActivityIndicator size="large" color={COLORS.primaryRed} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={COLORS.primaryRed} />
                                        <Text style={{ marginTop: 12, fontSize: 16, color: '#1F2937' }}>
                                            <Text style={{ color: COLORS.primaryRed, fontWeight: '700' }}>Upload a file</Text> or drag & drop
                                        </Text>
                                        <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textSecondary }}>
                                            PNG, JPG, gif UP TO 10MB
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        {/* Bottom Sticky Button */}
                        <View style={{ paddingTop: 16 }}>
                            <CustomGradientButton
                                title={submitting ? 'Submitting...' : 'Confirm Entry'}
                                containerStyle={{ borderRadius: 10 }}
                                borderRadius={10}
                                onPress={handleSubmit}
                                disabled={submitting || tasks.filter(t => t.required && !(t.completed ?? false)).length > 0}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    );
}
