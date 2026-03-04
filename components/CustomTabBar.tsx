import { import_img } from "@/assets/import_img";
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function CustomTabBar({ state, descriptors, navigation }: any) {
    return (
        <View style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 30 : 15,
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: 15,
        }}>
            <View style={{
                flexDirection: 'row',
                display: 'flex',
                padding: 4,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6.749,
                borderRadius: 53.991,
                borderWidth: 0.472,
                borderColor: 'rgba(255, 255, 255, 0.60)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                height: 70,
                width: '100%',
                ...Platform.select({
                    ios: {
                        shadowColor: 'rgba(0, 0, 0, 0.20)',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 4,
                    },
                    android: {
                        elevation: 4,
                    },
                }),
            }}>
                {state.routes.map((route: any, index: number) => {
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const getTabImage = (name: string) => {
                        if (name === 'index' || name === 'Home') return import_img.home_icon;
                        if (name === 'calendar' || name === 'Calendar') return import_img.calendar_icon;
                        if (name === 'graph' || name === 'Graph') return import_img.graph_icon;
                        if (name === 'menu' || name === 'Menu') return import_img.menu_icon;
                        return null;
                    };
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            activeOpacity={0.9}
                            style={{
                                flex: isFocused ? 3 : 1,
                                height: '80%',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isFocused ? (
                                <LinearGradient
                                    colors={['#990009', '#C21923']}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderRadius: 40,
                                        paddingLeft: 5,
                                        paddingRight: 15,
                                    }}
                                >
                                    <View style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: 22.5,
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                    }}>
                                        <Image
                                            source={getTabImage(route.name)}
                                            style={{ width: 22, height: 22 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        marginLeft: 10,
                                        textTransform: 'capitalize'
                                    }} numberOfLines={1}>
                                        {route.name === 'index' ? 'Home' : route.name}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={{
                                    width: 45,
                                    height: 45,
                                    borderRadius: 22.5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Image
                                        source={getTabImage(route.name)}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            tintColor: '#444',
                                            opacity: 0.7
                                        }}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}