import { import_img } from '@/assets/import_img';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Joined Contests');
    const [submissionFilter, setSubmissionFilter] = useState('Approved');

    const stats = [
        { label: 'Contests Joined', value: '03' },
        { label: 'Pending Review', value: '03' },
        { label: 'Submissions Approved', value: '03' },
    ];

    const contests = [
        {
            id: 1,
            title: 'Win a Premium Gaming Setup',
            description: 'Capture the essence of summer in a single photo. We are looking for vibrant colors, outdoor adventures, and sunny vibes.',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500', 
            status: 'Active',
            statusColor: '#00FF88',
            statusBg: '#E6FFF4',
        },
        {
            id: 2,
            title: 'Win a Premium Gaming Setup',
            description: 'Capture the essence of summer in a single photo. We are looking for vibrant colors, outdoor adventures, and sunny vibes.',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500',
            status: 'Ended',
            statusColor: '#FF6B6B',
            statusBg: '#FFF0F0',
        }
    ];
    const notificationsData = [
        { id: '1', title: 'Concert Ending Soon', message: 'Your entry for "Summer Photography Challenge" has been approved!', date: '2024-06-11' },
        { id: '2', title: 'Concert Ending Soon', message: 'Your entry for "Summer Photography Challenge" has been approved!', date: '2024-06-11' },
        { id: '3', title: 'New Contest Live', message: 'Check out the new Premium Gaming Setup contest and join now.', date: '2024-06-10' },
        { id: '4', title: 'Submission Deadline', message: 'Only 2 hours left to submit your design for the Minimalist Logo contest.', date: '2024-06-09' },
    ];
    // Notification item component
    const NotificationItem = ({ title, message, date }: { title: string; message: string; date: string }) => (
        <View style={{
            backgroundColor: '#FFF',
            borderRadius: 12,
            marginBottom: 15,
            padding: 15,
            flexDirection: 'column',
            borderWidth: 1,
            borderColor: '#F0F0F0',
            borderLeftWidth: 4,
            borderLeftColor: '#A30000',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
        }}>
            <View style={{ marginRight: 12, marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={import_img.notify_icon} style={{ width: 24, height: 24 }} />
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1D2939' }}>{title}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#4F586D', marginTop: 4, lineHeight: 20 }}>{message}</Text>
                <Text style={{ fontSize: 14, color: '#5B6477', marginTop: 8, fontWeight: '700' }}>{date}</Text>
            </View>
        </View>
    );

    // Expanded Data for better UI testing
    const mySubmissionsData = [
        // Approved Submissions
        { id: '1', title: 'Win a Premium Gaming Setup', date: '26 January 2026', status: 'Approved' },
        { id: '2', title: 'Street Photography Contest', date: '20 January 2026', status: 'Approved' },
        { id: '3', title: 'Minimalist Logo Design', date: '15 January 2026', status: 'Approved' },
        { id: '4', title: 'Summer Travel Vlog', date: '10 January 2026', status: 'Approved' },

        // Pending Submissions
        { id: '5', title: 'Win a Premium Gaming Setup', date: '26 January 2026', status: 'Pending' },
        { id: '6', title: 'Win a Premium Gaming Setup', date: '26 January 2026', status: 'Pending' },
        { id: '7', title: 'Creative Writing Challenge', date: '02 February 2026', status: 'Pending' },
        { id: '8', title: 'Digital Art Showcase', date: '04 February 2026', status: 'Pending' },

        // Rejected Submissions
        { id: '9', title: 'Win a Premium Gaming Setup', date: '26 January 2026', status: 'Rejected' },
        { id: '10', title: 'Logo Redesign Contest', date: '12 January 2026', status: 'Rejected' },
        { id: '11', title: 'Nature Photography', date: '05 January 2026', status: 'Rejected' },
        { id: '12', title: 'UI/UX Mobile App Design', date: '01 January 2026', status: 'Rejected' },
    ];

    const SubmissionItem = ({ title, date, status }: { title: string; date: string; status: string }) => {

        const getStatusStyles = () => {
            switch (status) {
                case 'Pending':
                    return {
                        bg: '#FFF9EB',
                        color: '#F59E0B',
                        icon: '🕒'
                    };
                case 'Rejected':
                    return {
                        bg: '#FFF1F0',
                        color: '#F04438',
                        icon: '✕' 
                    };
                default: // Approved
                    return {
                        bg: '#E6FFF4',
                        color: '#00C853',
                        icon: '✓'
                    };
            }
        };

        const styles = getStatusStyles();

        return (
            <TouchableOpacity onPress={() => router.push(`/contest-detail-screen?status=${status}`)} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF',
                padding: 15,
                borderRadius: 15,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#F0F0F0',
                // Added slight shadow to match card appearance
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            }}>
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: styles.bg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                }}>
                    <Text style={{
                        color: styles.color,
                        fontSize: status === 'Pending' ? 18 : 16,
                        fontWeight: 'bold'
                    }}>
                        {styles.icon}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#344054' }}>{title}</Text>
                    <Text style={{ fontSize: 13, color: '#98A2B3', marginTop: 4 }}>Submitted on {date}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <Header title="Dashboard" />
            <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>

                {/* Stats Row */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
                    {stats.map((item, index) => (
                        <View key={index} style={{
                            backgroundColor: '#D21F2A0A',
                            width: index === 2 ? '100%' : '48%',
                            padding: 15,
                            borderRadius: 15,
                            marginTop: index === 2 ? 10 : 0,
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#666', fontWeight: '500' }}>{item.label}</Text>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#A30000' }} />
                            </View>
                            <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 10, color: '#333' }}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Main Tab Switcher */}
                <View style={{ flexDirection: 'row', backgroundColor: '#F5F7FA', borderRadius: 10, marginBottom: 20 }}>
                    {['Joined Contests', 'My Submissions', 'Notification'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                backgroundColor: activeTab === tab ? '#A30000' : 'transparent',
                                borderRadius: 8,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: activeTab === tab ? '#FFF' : '#666', fontSize: 12, fontWeight: '600' }}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- CONDITIONAL RENDERING --- */}

                {activeTab === 'Joined Contests' && contests.map((item) => (
                    <View key={item.id} style={{
                        backgroundColor: '#FFF',
                        borderRadius: 20,
                        marginBottom: 20,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#F0F0F0',
                        padding: 15,
                        // Shadow for iOS/Android
                        elevation: 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2
                    }}>
                        <View style={{ position: 'relative' }}>
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: '100%', height: 180, borderRadius: 15 }}
                            />
                            <View style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                backgroundColor: item.statusBg,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.statusColor, marginRight: 6 }} />
                                <Text style={{ fontSize: 12, fontWeight: '700', color: item.statusColor }}>{item.status}</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A2E4C', marginTop: 15 }}>
                            {item.title}
                        </Text>

                        <Text style={{ fontSize: 13, color: '#7A869A', lineHeight: 20, marginTop: 8 }}>
                            {item.description}
                        </Text>

                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <TouchableOpacity style={{
                                borderWidth: 1,
                                borderColor: '#A30000',
                                borderRadius: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                marginRight: 15
                            }}>
                                <Text style={{ color: '#A30000', fontWeight: '600' }}>View Contest</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{
                                backgroundColor: '#E8EAF6',
                                borderRadius: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 20
                            }}>
                                <Text style={{ color: '#918EF4', fontWeight: '600' }}>Giveway</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {activeTab === 'My Submissions' && (
                    <View>
                        {/* Sub-Tabs */}
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: '#F2F4F7',
                            borderRadius: 12,
                            padding: 4,
                            marginBottom: 20
                        }}>
                            {['Approved', 'Pending', 'Rejected'].map((subTab) => (
                                <TouchableOpacity
                                    key={subTab}
                                    onPress={() => setSubmissionFilter(subTab)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        backgroundColor: submissionFilter === subTab ? '#A30000' : 'transparent',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{
                                        color: submissionFilter === subTab ? '#FFF' : '#667085',
                                        fontWeight: '600',
                                        fontSize: 14
                                    }}>{subTab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Filtered Submissions List */}
                        {mySubmissionsData
                            .filter(item => item.status === submissionFilter)
                            .map((item) => (
                                <SubmissionItem
                                    key={item.id}
                                    title={item.title}
                                    date={item.date}
                                    status={item.status}
                                />
                            ))
                        }
                    </View>
                )}
                {activeTab === 'Notification' && (
                    <View style={{ marginTop: 5 }}>
                        {notificationsData.map((item) => (
                            <NotificationItem
                                key={item.id}
                                title={item.title}
                                message={item.message}
                                date={item.date}
                            />
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;


