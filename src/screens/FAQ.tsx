import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

interface FAQItemProps {
    question: string;
    answer: string;
    isExpanded: boolean;
    onPress: () => void;
}

// Enable layout animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isExpanded, onPress }) => {
    return (
        <View style={styles.faqContainer}>
            <TouchableOpacity
                style={styles.questionRow}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Text style={styles.questionText}>{question}</Text>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                />
            </TouchableOpacity>
            {isExpanded && (
                <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{answer}</Text>
                </View>
            )}
        </View>
    );
};

interface FAQData {
    id: number;
    question: string;
    answer: string;
}

const FAQ = () => {
    const [expandedId, setExpandedId] = useState<number | null>(1);

    const faqData: FAQData[] = [
        {
            id: 1,
            question: 'How do I book a service App?',
            answer: 'Select your service, pick a date & time, and confirm. You\'ll get a notification with details.',
        },
        {
            id: 2,
            question: 'Can I reschedule or cancel my booking?',
            answer: 'Yes, you can reschedule or cancel your booking up to 24 hours before the scheduled time through the app.',
        },
        {
            id: 3,
            question: 'What payment methods are accepted?',
            answer: 'We accept credit/debit cards, mobile banking, and cash on delivery for most services.',
        },
        {
            id: 4,
            question: 'How do I contact the service provider?',
            answer: 'Once your booking is confirmed, you can contact the service provider through the in-app chat or call feature.',
        },
        {
            id: 5,
            question: 'Is my personal information safe?',
            answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information.',
        },
    ];

    const handlePress = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="FAQ"
                backgroundColor="#EFF1F3"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* FAQ Items */}
                <View style={styles.faqList}>
                    {faqData.map((item) => (
                        <FAQItem
                            key={item.id}
                            question={item.question}
                            answer={item.answer}
                            isExpanded={expandedId === item.id}
                            onPress={() => handlePress(item.id)}
                        />
                    ))}
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
    faqList: {
        gap: 12,
    },
    faqContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 4,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    questionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        paddingRight: 8,
    },
    answerContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    answerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default FAQ;
