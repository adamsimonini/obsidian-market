import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { WalletProvider } from '../../contexts/WalletContext';
import { WalletButton } from '../../components/WalletButton';
import { MarketList } from '../../components/MarketList';
import { CreateMarketForm } from '../../components/CreateMarketForm';
import { BetForm } from '../../components/BetForm';
import type { Market } from '../../types/supabase';

export default function HomeScreen() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <WalletProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Obsidian Market</Text>
          <WalletButton />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {selectedMarket ? (
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedMarket(null)}
              >
                <Text style={styles.backButtonText}>← Back to Markets</Text>
              </TouchableOpacity>
              <BetForm
                market={selectedMarket}
                onClose={() => setSelectedMarket(null)}
              />
            </View>
          ) : showCreateForm ? (
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={styles.backButtonText}>← Back to Markets</Text>
              </TouchableOpacity>
              <CreateMarketForm onClose={() => setShowCreateForm(false)} />
            </View>
          ) : (
            <View>
              <View style={styles.marketsHeader}>
                <Text style={styles.marketsTitle}>Markets</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text style={styles.createButtonText}>Create Market</Text>
                </TouchableOpacity>
              </View>
              <MarketList onMarketSelect={setSelectedMarket} />
            </View>
          )}
        </ScrollView>
      </View>
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
  },
  marketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  marketsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
