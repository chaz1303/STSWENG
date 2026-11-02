const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// Lets the app import the shared contract and steps from ../src instead of copying them.
config.watchFolders = [path.resolve(__dirname, '../src')];

module.exports = config;
