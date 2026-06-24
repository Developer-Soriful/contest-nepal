const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  '@': './',
};

// Block the nested react-native@0.86.0 that npm incorrectly installs as a
// peer dependency of @react-native/virtualized-lists@0.81.5. That version
// contains VirtualViewExperimentalNativeComponent.js whose complex Flow event
// type is incompatible with the @react-native/codegen@0.81.5 parser,
// causing "Unable to determine event arguments for onModeChange".
const nestedRNPath = path.join(
  __dirname,
  'node_modules',
  'react-native',
  'node_modules',
  'react-native'
);
config.resolver.blockList = [
  new RegExp(`^${nestedRNPath.replace(/\\/g, '\\\\')}.*`),
];

module.exports = config;
