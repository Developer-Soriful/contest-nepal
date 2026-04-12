const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for AsyncStorage and other native modules
config.resolver.alias = {
  '@': './',
};

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native'];

// Add support for more file extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

module.exports = config;
