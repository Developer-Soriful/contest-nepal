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

    // Dynamic Data
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
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500', // Gaming setup placeholder
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <Header title="Dashboard" />
            <ScrollView contentContainerStyle={{ padding: 15 }}>

                {/* Stats Row */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
                    {stats.map((item, index) => (
                        <View key={index} style={{
                            backgroundColor: '#FFF8F9',
                            width: index === 2 ? '100%' : '48%',
                            padding: 15,
                            borderRadius: 15,
                            marginTop: index === 2 ? 10 : 0,
                            borderWidth: 1,
                            borderColor: '#F0F0F0'
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#666', fontWeight: '500' }}>{item.label}</Text>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#A30000' }} />
                            </View>
                            <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 10, color: '#333' }}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Tab Switcher */}
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#F5F7FA',
                    borderRadius: 10,
                    padding: 5,
                    marginBottom: 20
                }}>
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
                            <Text style={{
                                color: activeTab === tab ? '#FFF' : '#666',
                                fontSize: 12,
                                fontWeight: '600'
                            }}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contest Cards */}
                {contests.map((item) => (
                    <View key={item.id} style={{
                        backgroundColor: '#FFF',
                        borderRadius: 20,
                        marginBottom: 20,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#F0F0F0',
                        padding: 15,
                        // Shadow for iOS/Android
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5
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
            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;