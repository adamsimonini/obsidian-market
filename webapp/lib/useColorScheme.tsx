import { useEffect } from 'react';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

import { COLORS } from '@/theme/colors';

function useColorScheme() {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();

  // Initialize to dark if not set
  useEffect(() => {
    if (!colorScheme) {
      setColorScheme('light');
    }
  }, [colorScheme, setColorScheme]);

  function toggleColorScheme() {
    const newScheme = (colorScheme ?? 'light') === 'light' ? 'dark' : 'light';
    return setColorScheme(newScheme);
  }

  const currentScheme = colorScheme ?? 'light';

  return {
    colorScheme: currentScheme,
    isDarkColorScheme: currentScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[currentScheme],
  };
}

export { useColorScheme };

