import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Alert, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Entry interface with image support
interface Entry {
  id: string;
  title: string;
  episode: string;
  link: string;
  coverImage: string;
  localImageUri?: string;
}

// Load/Save functions
const loadEntries = async (): Promise<Entry[]> => {
  try {
    const stored = await AsyncStorage.getItem('reading_entries');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.log('Error loading entries:', error);
    return [];
  }
};

const saveEntries = async (entriesList: Entry[]) => {
  try {
    await AsyncStorage.setItem('reading_entries', JSON.stringify(entriesList));
  } catch (error) {
    console.log('Error saving entries:', error);
  }
};

export default function App() {
  const [entryList, setEntryList] = useState<Entry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [episode, setEpisode] = useState('');
  const [link, setLink] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadEntries().then(setEntryList);
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ขออนุญาต', 'แอพต้องการอนุญาตเพื่อเข้าถึงรูปภาพในเครื่อง');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setCoverImage(''); // Clear URL when image is selected
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ขออนุญาต', 'แอพต้องการอนุญาตเพื่อใช้กล้อง');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setCoverImage('');
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'เลือกรูปภาพ',
      'คุณต้องการเลือกรูปภาพจากแหล่งใด?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: '📷 ถ่ายรูป', onPress: takePhoto },
        { text: '🖼️ เลือกจากแกลลอรี่', onPress: pickImage },
      ]
    );
  };

  const addEntry = async () => {
    if (!title.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อเรื่อง');
      return;
    }

    try {
      const newEntry: Entry = {
        id: Date.now().toString(),
        title: title.trim(),
        episode: episode.trim(),
        link: link.trim(),
        coverImage: coverImage.trim(),
        localImageUri: selectedImageUri || undefined
      };

      const updatedEntries = [...entryList, newEntry];
      setEntryList(updatedEntries);
      await saveEntries(updatedEntries);
      
      // Clear form
      setTitle('');
      setEpisode('');
      setLink('');
      setCoverImage('');
      setSelectedImageUri(null);
      setIsAdding(false);
      
      Alert.alert('สำเร็จ', 'เพิ่มรายการสำเร็จ!');
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const deleteEntry = async (id: string) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบรายการนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = entryList.filter(entry => entry.id !== id);
            setEntryList(updatedEntries);
            await saveEntries(updatedEntries);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>📚 Reading App</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setIsAdding(!isAdding)}
        >
          <Text style={styles.addButtonText}>{isAdding ? '❌' : '➕'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isAdding && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>เพิ่มรายการใหม่</Text>
            
            {/* Image Selection */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>รูปปก:</Text>
              <View style={styles.imageOptions}>
                <TouchableOpacity style={styles.imageButton} onPress={showImageOptions}>
                  <Text style={styles.imageButtonText}>📷 เลือกรูปภาพ</Text>
                </TouchableOpacity>
                {selectedImageUri && (
                  <TouchableOpacity 
                    style={styles.clearImageButton} 
                    onPress={() => setSelectedImageUri(null)}
                  >
                    <Text style={styles.clearImageButtonText}>❌ ลบรูป</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {selectedImageUri && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                </View>
              )}
              
              <Text style={styles.orText}>หรือ</Text>
              
              <TextInput
                style={styles.input}
                placeholder="URL รูปปก"
                placeholderTextColor="#666"
                value={coverImage}
                onChangeText={(text) => {
                  setCoverImage(text);
                  if (text.trim()) setSelectedImageUri(null);
                }}
                autoCapitalize="none"
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="ชื่อเรื่อง *"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ตอนที่"
              placeholderTextColor="#666"
              value={episode}
              onChangeText={setEpisode}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ลิงค์"
              placeholderTextColor="#666"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setIsAdding(false);
                setTitle('');
                setEpisode('');
                setLink('');
                setCoverImage('');
                setSelectedImageUri(null);
              }}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addEntry}>
                <Text style={styles.saveButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>รายการของคุณ ({entryList.length})</Text>
          
          {entryList.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              {(entry.localImageUri || entry.coverImage) && (
                <View style={styles.entryCoverContainer}>
                  <Image 
                    source={{ uri: entry.localImageUri || entry.coverImage }} 
                    style={styles.entryCover}
                    contentFit="cover"
                  />
                </View>
              )}
              
              <View style={styles.entryContent}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.episode ? (
                  <Text style={styles.entryEpisode}>ตอนที่: {entry.episode}</Text>
                ) : null}
                {entry.link ? (
                  <Text style={styles.entryLink} numberOfLines={1}>🔗 {entry.link}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteEntry(entry.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {entryList.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>📖</Text>
              <Text style={styles.emptySubtext}>ยังไม่มีรายการ</Text>
              <Text style={styles.emptySubtext}>กดปุ่ม + เพื่อเพิ่มรายการใหม่</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  imageSection: {
    marginBottom: 15,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  imageOptions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearImageButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearImageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreview: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 0.45,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryCoverContainer: {
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  entryCover: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  entryContent: {
    flex: 1,
    paddingRight: 10,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  entryEpisode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  entryLink: {
    fontSize: 12,
    color: '#007bff',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#dc3545',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});