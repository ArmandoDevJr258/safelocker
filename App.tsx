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

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');

  // PIN states
  const [pinModalVisible, setPinModalVisible] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);

  const [langModalVisible, setLangModalVisible] = useState(false);


  //fake screens
  const [myFiles,setmyFiles]= useState(false);
  const [myPasswords,setmyPasswordss]= useState(false);
  const [myTrashbean,setmyTrashbean]= useState(false);


  // Load saved PIN and language/theme on app start
 useEffect(() => {
  const loadSettings = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('userPin');
      if (savedPin) {
        setStoredPin(savedPin);
        setSettingPin(false);
        setPinModalVisible(true); // keep it visible until correct PIN is entered
      } else {
        setSettingPin(true);
        setPinModalVisible(true); // first-time setup
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


  // Toggle dark/light theme
  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem('theme', newValue ? 'dark' : 'light');
    } catch (err) {
      console.log('Error saving theme:', err);
    }
  };

  // Get flag image based on language
  const getFlagSource = () => {
    switch (language) {
      case 'en': return require('./assets/united-states.png');
      case 'fr': return require('./assets/france.png');
      case 'pt': return require('./assets/portugal.png');
      default: return require('./assets/united-states.png');
    }
  };

  // Change language and save
  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem('language', lang);
      setLangModalVisible(false);
    } catch (err) {
      console.log('Error saving language:', err);
    }
  };

  // Handle PIN submit
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
    en: { greeting: 'Hello', darkMode: 'Dark Mode', chooseLanguage: 'Choose Language', Addedfiles:'Files recently added', Myfiles:'My files', Mypasswords:'My passwords', Mytrashbean:'My trash bean', enterPin: settingPin ? 'Set your PIN' : 'Enter PIN', Cancel:'Cancel' },
    fr: { greeting: 'Bonjour', darkMode: 'Mode sombre', chooseLanguage: 'Choisir la langue', Addedfiles:'Fichiers ajoutés', Myfiles:'Mes fichiers', Mypasswords:'Mes mots de passe', Mytrashbean:'Poubelle', enterPin: settingPin ? 'Définir votre PIN' : 'Entrez le PIN', Cancel:'Annuler' },
    pt: { greeting: 'Olá', darkMode: 'Modo escuro', chooseLanguage: 'Escolher idioma', Addedfiles:'Arquivos adicionados recentemente', Myfiles:'Meus arquivos', Mypasswords:'Minhas senhas', Mytrashbean:'Pasta de lixo', enterPin: settingPin ? 'Defina seu PIN' : 'Digite o PIN', Cancel:'Cancelar' },
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
          <TouchableOpacity>
            <View style={styles.view}>
              <Text style={styles.text1}>{t('Mypasswords')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setmyFiles(true)}>
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
      {myFiles&&(
        <Modal
        onRequestClose={()=>setmyFiles(false)}>
          <View style={styles.FilesView}>
            <View style={styles.filesheader}>
              <Text>My files</Text>

            </View>

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

// Styles (same as before)
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
  FilesView:{
    width:'100%',
    height:'100%',
    backgroundColor:'gray'
  },
  filesheader:{
    width:'100%',
    height:40,
    flexDirection:'row'
  }
});
