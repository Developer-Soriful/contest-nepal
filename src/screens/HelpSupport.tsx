import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

interface MenuItemProps {
    icon?: React.ReactNode;
    title: string;
    onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                {icon}
                <Text style={styles.menuItemText}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );
};

const HelpSupport = () => {
    const handleFAQ = () => {
        // Navigate to FAQ screen
        console.log('FAQ clicked');
        // router.push('/faq');
    };

    const handleContactUs = () => {
        // Navigate to Contact Us screen
        console.log('Contact Us clicked');
        // router.push('/contact-us');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Help & Support"
                backgroundColor="#EFF1F3"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon={<MaterialIcons name="help-outline" size={20} color="#666" />}
                        title="FAQ"
                        onPress={handleFAQ}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon={<Feather name="mail" size={20} color="#666" />}
                        title="Contact Us"
                        onPress={handleContactUs}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF1F3',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 30,
    },
    menuContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
});

export default HelpSupport;
