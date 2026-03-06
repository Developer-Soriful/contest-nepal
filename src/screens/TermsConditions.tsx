import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const TermsConditions = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Terms & Condition"
                backgroundColor="#EFF1F3"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View>
                    {/* Welcome Section */}
                    <Text style={styles.welcomeTitle}>Welcome to Services App !</Text>
                    <Text style={styles.introText}>
                        Accessing or using our services, you agree to be bound by these 
                        Terms of Service. If you do not agree with any part of the terms, 
                        you must not use our services.
                    </Text>

                    {/* Section 2 */}
                    <Text style={styles.sectionTitle}>2. User Responsibilities As a user, you agree to:</Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>Use the service only for lawful purposes.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>Provide accurate and complete information when required.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>Maintain the confidentiality of your account password.</Text>
                    </View>

                    {/* Section 3 */}
                    <Text style={styles.sectionTitle}>3. Intellectual Property</Text>
                    <Text style={styles.sectionText}>
                        All content, trademarks, and data on this service, including but not limited to 
                        text, graphics, logos, and images, are the property of [Your Company Name]
                    </Text>

                    {/* Section 4 */}
                    <Text style={styles.sectionTitle}>4. Disclaimers</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company 
                        Name] makes no warranties, expressed or implied, regarding the operation.
                    </Text>

                    {/* Section 5 */}
                    <Text style={styles.sectionTitle}>5. Disclaimers</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company 
                        Name] makes no warranties, expressed or implied, regarding the operation.
                    </Text>

                    {/* Section 6 */}
                    <Text style={styles.sectionTitle}>6. Disclaimers</Text>
                    <Text style={styles.sectionText}>
                        The service is provided on an "as is" and "as available" basis. [Your Company 
                        Name] makes no warranties, expressed or implied, regarding the operation.
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
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    introText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        lineHeight: 22,
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

export default TermsConditions;
