import { StyleSheet, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const dark = useColorScheme() === 'dark';
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#111113' : '#ffffff' }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: dark ? '#f2f2f4' : '#18181b' }]}>
        AgoraWeave
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 23, fontWeight: '600' },
});
