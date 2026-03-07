import CustomGradientButton from '@/src/components/CustomGradientButton';
import Header from '@/src/components/Header';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    Text,
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


export default function EntryFormScreen() {
    const [tasks, setTasks] = useState([
        { id: 1, name: 'twitter', completed: false },
        { id: 2, name: 'newsletter', completed: false }
    ]);

    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const toggleTask = (taskId: number) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        const completedTasks = tasks.filter(task => task.completed).length;
        if (completedTasks >= 3 && formData.fullName && formData.email) {
            router.replace('/contest-detail');
        } else {
            console.log('Please complete at least 3 tasks and fill required fields');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgLight }}>
            <Header
                title="Entry Form"
                backgroundColor="transparent"
            />

            <ScrollView showsVerticalScrollIndicator={false}>
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
                                Required Tasks
                            </Text>

                            {/* Task 1: Twitter */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => toggleTask(1)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: COLORS.borderLight,
                                    marginBottom: 12,
                                }}
                            >
                                <View style={{
                                    width: 40, height: 40, borderRadius: 20,
                                    backgroundColor: COLORS.taskIconBg,
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FontAwesome name="twitter" size={18} color={COLORS.primaryRed} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={{ fontWeight: '600', color: '#1F2937' }}>Follow us on Twitter</Text>
                                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>@Contest_Official</Text>
                                </View>
                                <View style={{
                                    width: 24, height: 24, borderRadius: 12,
                                    borderWidth: 2, borderColor: COLORS.borderLight,
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: tasks.find(t => t.id === 1)?.completed ? COLORS.primaryRed : 'transparent'
                                }}>
                                    {tasks.find(t => t.id === 1)?.completed && <Ionicons name="checkmark" size={16} color="white" />}
                                </View>
                            </TouchableOpacity>

                            {/* Task 2: Newsletter */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => toggleTask(2)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: COLORS.borderLight,
                                    marginBottom: 24,
                                }}
                            >
                                <View style={{
                                    width: 40, height: 40, borderRadius: 20,
                                    backgroundColor: COLORS.taskIconBg,
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MaterialCommunityIcons name="email-outline" size={18} color={COLORS.primaryRed} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={{ fontWeight: '600', color: '#1F2937' }}>Subscribe to Newsletter</Text>
                                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Get weekly updates</Text>
                                </View>
                                <View style={{
                                    width: 24, height: 24, borderRadius: 12,
                                    borderWidth: 2, borderColor: COLORS.borderLight,
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: tasks.find(t => t.id === 2)?.completed ? COLORS.primaryRed : 'transparent'
                                }}>
                                    {tasks.find(t => t.id === 2)?.completed && <Ionicons name="checkmark" size={16} color="white" />}
                                </View>
                            </TouchableOpacity>

                            {/* Upload Screenshot Section */}
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
                                Upload Screenshot (Optional)
                            </Text>

                            <TouchableOpacity
                                style={{
                                    height: 160,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: COLORS.uploadBorder,
                                    borderStyle: 'dashed',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#FAFAFA'
                                }}
                            >
                                <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={COLORS.primaryRed} />
                                <Text style={{ marginTop: 12, fontSize: 16, color: '#1F2937' }}>
                                    <Text style={{ color: COLORS.primaryRed, fontWeight: '700' }}>Upload a file</Text> or drag & drop
                                </Text>
                                <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textSecondary }}>
                                    PNG, JPG, gif UP TO 10MB
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {/* Bottom Sticky Button */}
                        <View style={{ paddingTop: 16 }}>
                            <CustomGradientButton
                                title="Confirm Entry"
                                containerStyle={{ borderRadius: 10 }}
                                borderRadius={10}
                                onPress={() => console.log('Confirm Entry pressed')}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    );
}
