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
            question: 'How do I participate in a contest?',
            answer: 'Browse active contests, select one you like, and tap "Participate Now". Follow the instructions and submit your entry before the deadline.',
        },
        {
            id: 2,
            question: 'Are contests free to join?',
            answer: 'Yes, most contests on Contest Nepal are completely free to enter. Some special events might have entry requirements, which will be clearly stated.',
        },
        {
            id: 3,
            question: 'How are winners selected?',
            answer: 'Winners are selected either by public voting or by the contest organizer\'s panel of judges, depending on the contest rules.',
        },
        {
            id: 4,
            question: 'When will I receive my prize?',
            answer: 'Prizes are distributed by the contest organizers within 7-14 days after the contest winners are officially announced.',
        },
        {
            id: 5,
            question: 'Is my submission public?',
            answer: 'Yes, once your submission is approved by the organizer, it becomes visible in the public gallery for voting and viewing.',
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
