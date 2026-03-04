import CustomTabBar from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

const HomeLayout = () => {
    return (
        <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
            <Tabs.Screen name="Home" />
            <Tabs.Screen name="Calendar" />
            <Tabs.Screen name="Graph" />
            <Tabs.Screen name="Menu" />
        </Tabs>
    );
};

export default HomeLayout