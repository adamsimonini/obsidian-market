import { ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';

export default function SettingsScreen() {
  return (
    <ScrollView>
      <YStack
        flexGrow={1}
        padding="$6"
        backgroundColor="$background"
      >
        <YStack
          backgroundColor="$backgroundHover"
          borderRadius="$3"
          padding="$6"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text fontSize="$7" fontWeight="600" color="$color" marginBottom="$2">
            Settings
          </Text>
          <Text color="$colorPress">
            App configuration controls will live here.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

