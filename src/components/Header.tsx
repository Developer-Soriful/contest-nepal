import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const BRAND_COLOR = "#990009";
const HEADER_HEIGHT = 56;

interface HeaderProps {
  title: string;
  onLeftPress?: () => void;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
}

const Header = ({
  title,
  onLeftPress,
  leftIconName = "chevron-back",
  rightElement,
  backgroundColor = "#FFFFFF",
}: HeaderProps) => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: HEADER_HEIGHT,
      paddingHorizontal: 16,
      backgroundColor: backgroundColor,
    }}>
      
      {/* Left Section */}
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        {onLeftPress && (
          <TouchableOpacity
            onPress={onLeftPress}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={{ padding: 4 }}
          >
            <Ionicons name={leftIconName} size={20} color={BRAND_COLOR} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section */}
      <View style={{ flex: 3 }}>
        <Text style={{
          textAlign: 'center',
          fontSize: 17,
          fontWeight: '600',
          color: '#1A1A1A',
        }} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Section */}
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {rightElement || <View style={{ width: 20 }} />}
      </View>
      
    </View>
  );
};

export default Header;