import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '../../src/components/CustomTabBar';
import ProtectedRoute from '../../src/components/ProtectedRoute';

const HomeLayout = () => {
    return (
        <ProtectedRoute>
            <Tabs 
                screenOptions={{ 
                    headerShown: false
                }} 
                tabBar={(props) => <CustomTabBar {...props} />}
            >
                <Tabs.Screen name="index" options={{ title: 'Home' }} />
                <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
                <Tabs.Screen name="graph" options={{ title: 'Graph' }} />
                <Tabs.Screen name="menu" options={{ title: 'Menu' }} />
            </Tabs>
        </ProtectedRoute>
    );
};

export default HomeLayout