module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation)/)',
  ],
};
