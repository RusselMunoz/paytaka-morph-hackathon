import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGradient from '../components/BackgroundGradient';
import GlassBox from '../components/GlassBox';

const CONTACTS_STORAGE_KEY = '@paytaka_contacts';

export default function ContactsScreen({ onBack }) {
  const [contacts, setContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const saveContacts = async (updatedContacts) => {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Failed to save contacts:', error);
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  const handleAddContact = () => {
    if (!newNickname.trim() || !newAddress.trim()) {
      Alert.alert('Missing Information', 'Please enter both nickname and wallet address');
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      nickname: newNickname.trim(),
      address: newAddress.trim(),
    };

    const updatedContacts = [...contacts, newContact];
    saveContacts(updatedContacts);
    
    setNewNickname('');
    setNewAddress('');
    setIsAdding(false);
  };

  const handleDeleteContact = (id) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contacts.filter(c => c.id !== id);
            saveContacts(updatedContacts);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundGradient />
      
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Contacts</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {contacts.length === 0 && !isAdding && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No contacts saved yet</Text>
            <Text style={styles.emptySubtext}>Add contacts to quickly send money</Text>
          </View>
        )}

        {contacts.map((contact) => (
          <GlassBox key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactNickname}>{contact.nickname}</Text>
              <Text style={styles.contactAddress} numberOfLines={1}>
                {contact.address}
              </Text>
            </View>
            <Pressable onPress={() => handleDeleteContact(contact.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>✕</Text>
            </Pressable>
          </GlassBox>
        ))}

        {isAdding ? (
          <GlassBox style={styles.addContactCard}>
            <Text style={styles.addContactTitle}>Add New Contact</Text>
            
            <Text style={styles.inputLabel}>Nickname</Text>
            <TextInput
              value={newNickname}
              onChangeText={setNewNickname}
              placeholder="e.g., Mom, Wife, Brother"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Wallet Address</Text>
            <TextInput
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="0x..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={styles.input}
              autoCapitalize="none"
            />

            <View style={styles.buttonRow}>
              <Pressable onPress={() => setIsAdding(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddContact} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </Pressable>
            </View>
          </GlassBox>
        ) : (
          <Pressable onPress={() => setIsAdding(true)} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Contact</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080707',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 12,
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactNickname: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  contactAddress: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '600',
  },
  addContactCard: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 12,
    borderRadius: 12,
  },
  addContactTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '700',
  },
});

// Made with Bob
