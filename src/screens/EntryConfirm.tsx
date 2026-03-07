import { import_img } from '@/assets/import_img';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

const EntryConfirmed = () => {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.replace('/dashboard');
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        }}>
            <View style={{
                backgroundColor: '#f5f4fe',
                borderRadius: 25,
                paddingVertical: 40,
                paddingHorizontal: 20,
                width: '90%',
                alignItems: 'center',
            }}>
                <View>
                    <Image source={import_img.success_icon} style={{ width: 38, height: 38 }} />
                </View>
                {/* Heading */}
                <Text style={{
                    color: '#a30000',
                    fontSize: 20,
                    fontWeight: '500',
                    marginBottom: 8,
                    textAlign: 'center',
                }}>
                    Entry Confirmed!
                </Text>

                {/* Subtext */}
                <Text style={{
                    color: '#5e6a82',
                    fontSize: 16,
                    lineHeight: 22,
                    textAlign: 'center',
                    marginBottom: 18,
                }}>
                    Good luck! You’ve successfully entered the giveaway.
                </Text>

                {/* Footer Text */}
                <Text style={{
                    color: '#5e6a82',
                    fontSize: 16,
                    fontWeight: '500',
                    textAlign: 'center',
                }}>
                    Redirecting to dashboard...
                </Text>
            </View>
        </View>
    );
};

export default EntryConfirmed;