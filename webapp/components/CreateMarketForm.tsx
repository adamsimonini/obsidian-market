import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../lib/supabase';

interface CreateMarketFormProps {
  onClose: () => void;
}

export function CreateMarketForm({ onClose }: CreateMarketFormProps) {
  const { address, connected } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin(address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resolution_rules: '',
    resolution_source: 'Admin manual',
    resolution_deadline: '',
    yes_odds: '2.0',
    no_odds: '2.0',
  });

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!connected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isAdmin) {
      setError('Only admins can create markets');
      return;
    }

    if (
      !formData.title ||
      !formData.resolution_rules ||
      !formData.resolution_deadline
    ) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const marketId = Date.now();

      const { data, error: supabaseError } = await supabase
        .from('markets')
        .insert({
          title: formData.title,
          description: formData.description || null,
          resolution_rules: formData.resolution_rules,
          resolution_source: formData.resolution_source,
          resolution_deadline: formData.resolution_deadline,
          status: 'open',
          yes_odds: parseFloat(formData.yes_odds),
          no_odds: parseFloat(formData.no_odds),
          creator_address: address,
          market_id_onchain: marketId.toString(),
        });

      if (supabaseError) {
        throw supabaseError;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create market');
    } finally {
      setLoading(false);
    }
  }, [connected, address, isAdmin, formData, onClose]);

  if (adminLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Checking admin status...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Only admins can create markets</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create New Market</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(val) => handleChange('title', val)}
          placeholder="Will Bitcoin reach $100k by end of 2024?"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(val) => handleChange('description', val)}
          placeholder="Additional details about the market..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Resolution Rules *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.resolution_rules}
          onChangeText={(val) => handleChange('resolution_rules', val)}
          placeholder="How will this market be resolved?"
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Resolution Deadline *</Text>
        <TextInput
          style={styles.input}
          value={formData.resolution_deadline}
          onChangeText={(val) => handleChange('resolution_deadline', val)}
          placeholder="YYYY-MM-DDTHH:mm"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.oddsRow}>
        <View style={styles.oddsField}>
          <Text style={styles.label}>Yes Odds</Text>
          <TextInput
            style={styles.input}
            value={formData.yes_odds}
            onChangeText={(val) => {
              if (val === '' || (!isNaN(Number(val)) && Number(val) > 0)) {
                handleChange('yes_odds', val);
              }
            }}
            placeholder="2.0"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.oddsField}>
          <Text style={styles.label}>No Odds</Text>
          <TextInput
            style={styles.input}
            value={formData.no_odds}
            onChangeText={(val) => {
              if (val === '' || (!isNaN(Number(val)) && Number(val) > 0)) {
                handleChange('no_odds', val);
              }
            }}
            placeholder="2.0"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Market</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  center: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: 'white',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#f44336',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    color: 'white',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  oddsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  oddsField: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  disabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

