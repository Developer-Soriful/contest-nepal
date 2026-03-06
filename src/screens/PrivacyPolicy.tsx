import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const PrivacyPolicy = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Privacy Policy"
                backgroundColor="#EFF1F3"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View>
                    {/* Welcome Section */}
                    <Text style={styles.welcomeTitle}>Welcome to Services App!</Text>
                    <Text style={styles.introText}>
                        Accessing or using our services, you agree to be bound by these Privacy Policy. 
                        If you do not agree with any part of the terms, you must not use our services.
                    </Text>

                    {/* Section 1 */}
                    <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                    <Text style={styles.sectionText}>
                        We collect information you provide directly to us, including:
                    </Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>Name, email address, and phone number.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>Profile information and account credentials.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>Payment and billing information.</Text>
                    </View>

                    {/* Section 2 */}
                    <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                    <Text style={styles.sectionText}>
                        We use the information we collect to provide, maintain, and improve our services, 
                        including but not limited to text, graphics, logos, and images for the property of [Your Company Name].
                    </Text>

                    {/* Section 3 */}
                    <Text style={styles.sectionTitle}>3. Data Security</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company Name] 
                        makes no warranties, expressed or implied, regarding the operation and security of your data.
                    </Text>

                    {/* Section 4 */}
                    <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company Name] 
                        makes no warranties, expressed or implied, regarding the operation of third-party integrations.
                    </Text>

                    {/* Section 5 */}
                    <Text style={styles.sectionTitle}>5. Your Rights</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company Name] 
                        makes no warranties, expressed or implied, regarding your rights to access, modify, or delete your data.
                    </Text>

                    {/* Section 6 */}
                    <Text style={styles.sectionTitle}>6. Contact Us</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company Name] 
                        makes no warranties, expressed or implied, regarding how to contact us for privacy concerns.
                    </Text>
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
    welcomeTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#990009',
        marginBottom: 16,
    },
    introText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 8,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 8,
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    bulletDot: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
        lineHeight: 22,
    },
    bulletText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        flex: 1,
    },
});

export default PrivacyPolicy;
