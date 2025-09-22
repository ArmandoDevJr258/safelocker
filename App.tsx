import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [folders, setFolders] = useState([]);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // PIN states
  const [pinModalVisible, setPinModalVisible] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);

  const [langModalVisible, setLangModalVisible] = useState(false);

  //fake screens
  const [myFiles, setmyFiles] = useState(false);
  const [myPasswords, setmyPasswords] = useState(false);
  const [myTrashbean, setmyTrashbean] = useState(false);

  // Load saved folders from AsyncStorage on mount
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const savedFolders = await AsyncStorage.getItem('folders');
        if (savedFolders) setFolders(JSON.parse(savedFolders));
      } catch (err) {
        console.log(err);
      }
    };
    loadFolders();
  }, []);

  // Pick a file from device
  const pickFile = async () => {
    if (!selectedFolder) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.type === 'success') {
        const newFile = { id: Date.now().toString(), name: result.name, uri: result.uri };

        const updatedFolders = folders.map(folder => {
          if (folder.id === selectedFolder.id) {
            return { ...folder, files: [...folder.files, newFile] };
          }
          return folder;
        });

        setFolders(updatedFolders);

        // Update selectedFolder from the updated array
        const updatedSelected = updatedFolders.find(f => f.id === selectedFolder.id);
        setSelectedFolder(updatedSelected);

        await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
      }
    } catch (err) {
      console.log(err);
    }
  };


  // Render each file in FlatList
const renderFile = ({ item }) => (
    <TouchableOpacity
        style={styles.fileItem}
        onPress={() => Alert.alert('File selected', item.name)}
    >
        <Text style={styles.fileText}>{item.name}</Text>
    </TouchableOpacity>
);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedPin = await AsyncStorage.getItem('userPin');
        if (savedPin) setStoredPin(savedPin);
        else setSettingPin(true);

        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang) setLanguage(savedLang);

        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) setIsDark(savedTheme === 'dark');

        const savedFolders = await AsyncStorage.getItem('folders');
        if (savedFolders) setFolders(JSON.parse(savedFolders));
      } catch (err) {
        console.log('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  const addNewFolder = async () => {
    try {
      const newFolderName = `Untitled Folder${folders.length + 1}`;
      const newFolders = [...folders, { id: Date.now().toString(), name: newFolderName, files: [] }];
      setFolders(newFolders);
      await AsyncStorage.setItem('folders', JSON.stringify(newFolders));
    } catch (err) {
      console.log('Error saving folder:', err);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedPin = await AsyncStorage.getItem('userPin');
        if (savedPin) {
          setStoredPin(savedPin);
          setSettingPin(false);
          setPinModalVisible(true);
        } else {
          setSettingPin(true);
          setPinModalVisible(true);
        }

        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang) setLanguage(savedLang);

        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) setIsDark(savedTheme === 'dark');
      } catch (err) {
        console.log('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem('theme', newValue ? 'dark' : 'light');
    } catch (err) {
      console.log('Error saving theme:', err);
    }
  };

  const getFlagSource = () => {
    switch (language) {
      case 'en': return require('./assets/united-states.png');
      case 'fr': return require('./assets/france.png');
      case 'pt': return require('./assets/portugal.png');
      default: return require('./assets/united-states.png');
    }
  };

  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem('language', lang);
      setLangModalVisible(false);
    } catch (err) {
      console.log('Error saving language:', err);
    }
  };

  const handlePinSubmit = async () => {
    if (settingPin) {
      if (pinInput.length < 4) {
        Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN');
        return;
      }
      try {
        await AsyncStorage.setItem('userPin', pinInput);
        setStoredPin(pinInput);
        setPinInput('');
        setSettingPin(false);
        setPinModalVisible(false);
        Alert.alert('Success', 'PIN set successfully!');
      } catch (err) {
        console.log('Error saving PIN:', err);
      }
    } else {
      if (pinInput === storedPin) {
        setPinInput('');
        setPinModalVisible(false);
      } else {
        Alert.alert('Incorrect PIN', 'Please try again');
        setPinInput('');
      }
    }
  };

  const translations = {
    en: {
      greeting: 'Hello',
      darkMode: 'Dark Mode',
      chooseLanguage: 'Choose Language',
      Addedfiles: 'Files recently added',
      Myfiles: 'My files',
      Mypasswords: 'My passwords',
      Mytrashbean: 'My trash bean',
      enterPin: settingPin ? 'Set your PIN' : 'Enter PIN',
      Cancel: 'Cancel',
    },
    fr: {
      greeting: 'Bonjour',
      darkMode: 'Mode sombre',
      chooseLanguage: 'Choisir la langue',
      Addedfiles: 'Fichiers ajoutés',
      Myfiles: 'Mes fichiers',
      Mypasswords: 'Mes mots de passe',
      Mytrashbean: 'Poubelle',
      enterPin: settingPin ? 'Définir votre PIN' : 'Entrez le PIN',
      Cancel: 'Annuler',
    },
    pt: {
      greeting: 'Olá',
      darkMode: 'Modo escuro',
      chooseLanguage: 'Escolher idioma',
      Addedfiles: 'Arquivos adicionados recentemente',
      Myfiles: 'Meus arquivos',
      Mypasswords: 'Minhas senhas',
      Mytrashbean: 'Pasta de lixo',
      enterPin: settingPin ? 'Defina seu PIN' : 'Digite o PIN',
      Cancel: 'Cancelar',
    },
  };

  const t = (key) => translations[language]?.[key] || key;

  return (
    <View style={[styles.container, isDark ? styles.dark : styles.light]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* PIN Modal */}
      <Modal visible={pinModalVisible} animationType="slide" >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitleText}>{t('enterPin')}</Text>
            <TextInput
              style={styles.input}
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="****"
            />
            <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
              <Text style={styles.buttonText}>{settingPin ? 'Set PIN' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>safelocker</Text>
        <TouchableOpacity style={styles.btnmode} onPress={toggleTheme}>
          <Image source={isDark ? require('./assets/brightness.png') : require('./assets/night-mode.png')} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnflag} onPress={() => setLangModalVisible(true)}>
          <Image source={getFlagSource()} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnsettings}>
          <Image source={require('./assets/settings.png')} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.maincontainer}>
        <View style={styles.topview}>
          <TouchableOpacity onPress={() => setmyPasswords(true)}>
            <View style={styles.view}>
              <Text style={styles.text1}>{t('Mypasswords')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setmyFiles(true)}>
            <View style={styles.view}>
              <Text style={styles.text1}>{t('Myfiles')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomview}>
          <TouchableOpacity>
            <View style={styles.view2}>
              <Text style={styles.text1}>{t('Mytrashbean')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={styles.addview}>
              <Image source={require('./assets/add-button.png')} style={{ width: 100, height: 100, marginTop: 20 }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Modal */}
      <Modal visible={langModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitleText}>{t('chooseLanguage')}</Text>
            <FlatList
              data={[{ code: 'en', label: 'English' }, { code: 'fr', label: 'Français' }, { code: 'pt', label: 'Português' }]}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => changeLanguage(item.code)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setLangModalVisible(false)}>
              <Text style={styles.closeText}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {myFiles && (
        <Modal
          onRequestClose={() => setmyFiles(false)}>
          <View style={styles.FilesView}>
            <View style={styles.filesheader}>
              <Text style={{ marginLeft: 20, fontSize: 20, fontWeight: 'bold', color: 'white' }}>{t('Myfiles')}</Text>
              <TouchableOpacity style={styles.btnnewfolder} onPress={addNewFolder}>
                <Image
                  source={require('./assets/add-file.png')}
                  style={{ width: 25, height: 25 }}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnsort}>
                <Image
                  source={require('./assets/sort.png')}
                  style={{ width: 25, height: 25 }}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btngrid}>
                <Image
                  source={require('./assets/visualization.png')}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFolder(item);
                    setFolderModalVisible(true);
                  }}
                  onLongPress={() => Alert.alert('Long Press', `You long-pressed ${item.name}`)}
                >
                  <View style={{
                    padding: 10,
                    margin: 5,
                    backgroundColor: 'lightgray',
                    borderRadius: 8,
                    width: '50%',
                    marginLeft: 20
                  }}>
                    <Text>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      )}

      {/* The Folder Modal */}
      <Modal visible={folderModalVisible}
       animationType="slide"
       onRequestClose={() => setFolderModalVisible(false)}>
    <View style={styles.foldermodalContainer}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{selectedFolder?.name}</Text>
        <Text style={{ marginTop: 10 }}>This is a fake folder screen.</Text>

        <FlatList
            data={selectedFolder?.files || []}
            keyExtractor={(item) => item.id}
            renderItem={renderFile}
            contentContainerStyle={{ paddingTop: 20, margin: 30 }}
        />

        {/* ... (Your other code for the add file button) */}
    </View>
</Modal>

      {myPasswords && (
        <Modal
          onRequestClose={() => setmyPasswords(false)}>
          <View style={styles.passwordView}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 20, color: 'white' }}>{t('Mypasswords')}</Text>
          </View>
        </Modal>
      )}

      {/* Footer */}
      <View style={styles.footerView}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 30, marginTop: 5 }}>
          {t('Addedfiles')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dark: { backgroundColor: '#222' },
  light: { backgroundColor: '#fff' },
  header: { position: 'absolute', top: 20, width: '100%', height: 50, flexDirection: 'row', gap: 20 },
  appName: { fontSize: 30, fontWeight: 'bold', color: 'orange', marginLeft: 20 },
  btnmode: { marginLeft: 50, marginTop: 12 },
  btnflag: { marginLeft: 10, marginTop: 12 },
  btnsettings: { marginLeft: 10, marginTop: 12 },
  maincontainer: { width: '90%', height: 450, backgroundColor: 'gray', marginTop: -150, borderRadius: 20 },
  topview: { flexDirection: 'row', width: '100%' },
  bottomview: { flexDirection: 'row' },
  view: { width: 150, height: 150, backgroundColor: 'darkgray', margin: 10, marginTop: 50, borderRadius: 10 },
  view2: { width: 200, height: 150, backgroundColor: 'darkgray', margin: 10, marginTop: 50, borderRadius: 10 },
  addview: { width: 100, height: 150, margin: 10, marginTop: 50, borderRadius: 10 },
  footerView: { position: 'absolute', bottom: 0, width: '100%', height: 250, backgroundColor: 'lightgreen', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  text1: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 50, textAlign: 'center' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitleText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '60%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, textAlign: 'center', fontSize: 20, marginBottom: 20 },
  button: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: 'white', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  option: { paddingVertical: 10, paddingHorizontal: 8 },
  optionText: { fontSize: 16 },
  closeBtn: { marginTop: 10, alignSelf: 'flex-end' },
  closeText: { color: 'red' },

  //fake screen View
  FilesView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'gray'
  },
  filesheader: {
    width: '100%',
    height: 40,
    flexDirection: 'row'
  },
  btnnewfolder: {
    position: 'absolute',
    left: 200,

  },
  btnsort: {
    position: 'absolute',
    left: 260,
  },
  btngrid: {
    position: 'absolute',
    left: 310,
  },

  passwordView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'gray'
  },
  foldermodalContainer: {
    flex: 1
  },
  fileItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  fileText: {
    fontSize: 16,
  }
});