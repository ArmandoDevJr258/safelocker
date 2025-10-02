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
  Alert,
  Switch,
  
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Image as RNImage } from 'react-native';


export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [folders, setFolders] = useState([]);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderedit, setfolderedit] = useState(false);
  const [header, setheader] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [lockfolder,setlockfolder] = useState(false);
  const [flatListKey, setFlatListKey] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [isGrid, setIsGrid] = useState(false); 
  const [selectedFile, setSelectedFile] = useState(null);
   const [fileModalVisible, setFileModalVisible] = useState(false);
    const [trash, setTrash] = useState([]);
    const[toglehide,setToggleHide] = useState(true);
  const [AcessPin,setAcessPin]= useState(false);
  const [SavedPin,setSavedPin]= useState(false);
  const [see,setsee] = useState(true);
  const [hide,setHide]= useState(false);
  const [appversion,setappVersion] = useState(false);
  const [devinfo,setDevInfo] = useState(false);
  const [privacypolicy,setPrivacyPolicy] =useState(false);
   const [lockPinModalVisible, setLockPinModalVisible] = useState(false); // New state for setting the PIN
  const [unlockPinModalVisible, setUnlockPinModalVisible] = useState(false); // New state for opening the folder
  const [currentFolderPin, setCurrentFolderPin] = useState(''); // Pin being set or entered for the specific folder
  const [isSettingNewPin, setIsSettingNewPin] = useState(false); // To differentiate between setting and entering PIN

    

    const [Pin,setPin]= useState(false);
// selected items ids in trash
  const [selectedTrashItems, setSelectedTrashItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false); 
  const [file,setfile]=useState(false);



  // PIN states
  const [pinModalVisible, setPinModalVisible] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);

  const [langModalVisible, setLangModalVisible] = useState(false);

  // fake screens
  const [myFiles, setmyFiles] = useState(false);
  const [myPasswords, setmyPasswords] = useState(false);
  const [setttingsView,setsettingsView]= useState(false);
  const [trashView,settrashView]= useState(false);


  //Settings

  const [apearence,setApearence] = useState(false);
  const [fileManagament,setFileManagement] = useState(false);
  const [security,setSecurity]= useState(false);
  const [aboutApp,setAboutApp]= useState(false);
  const [contactDev,setContactDev]= useState(false);
  const [help,setHelp] = useState(false);
  const [faq,setFaq] = useState(false);
  const [ clearData,setClearData] = useState(false);

  //apearence box
  const [theme,setTheme]= useState(false);
  const[font,setfont]= useState(false);
 
 //File management  box
  const [backup,setBackup]= useState(false);
 

   //Security box
  const [authentication,setAuthentication]= useState(false);
  const[lockTimer,setLockTimer]= useState(false);

   //About App box
  const [policy,setPolic]= useState(false);
 
   //apearence box
 
  //Contanct Dev  box
  

   //Help box
  const [helpsettingitem,setHelpsettingitem]= useState(false);
  const[troubleshooting,setTroubleshooting]= useState(false);

    //Clear Data  box
  const [clearCache,setClearCache]= useState(false);
  const[clearfilles,setClearFilles]= useState(false);


 
 // ... after handleDeleteFile2 function

// 🔒 Logic for Locking Folder 🔒
const handleSetFolderPin = async () => {
  if (!selectedFolder || currentFolderPin.length < 4) {
    Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
    return;
  }

  const updatedFolders = folders.map(f =>
    f.id === selectedFolder.id ? { ...f, pin: currentFolderPin } : f
  );

  setFolders(updatedFolders);
  // Update selectedFolder state as well
  setSelectedFolder(prev => ({ ...prev, pin: currentFolderPin }));

  await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));

  setLockPinModalVisible(false);
  setCurrentFolderPin('');
  setIsSettingNewPin(false);
  Alert.alert('Success', `Folder "${selectedFolder.name}" locked.`);
};

// 🔓 Logic for Unlocking/Opening Folder 🔓
const handleUnlockFolder = () => {
  if (!selectedFolder) return;

  if (currentFolderPin === selectedFolder.pin) {
    setUnlockPinModalVisible(false);
    setCurrentFolderPin('');
    // Proceed to open the folder modal (existing logic)
    setFolderModalVisible(true);
  } else {
    Alert.alert('Incorrect PIN', 'Please try again.');
    setCurrentFolderPin('');
  }
};

// ... before pickFile function
 
 
 

  // Load saved folders from AsyncStorage on mount
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const savedFolders = await AsyncStorage.getItem('folders');
        if (savedFolders) {
          const loadedFolders = JSON.parse(savedFolders);
          const defaultFolderExists = loadedFolders.some(f => f.id === 'default_folder');
          if (!defaultFolderExists) {
            const defaultFolder = { id: 'default_folder', name: 'Default Folder', files: [] };
            const updatedFolders = [defaultFolder, ...loadedFolders];
            setFolders(updatedFolders);
            await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
          } else {
            setFolders(loadedFolders);
          }
        } else {
          const defaultFolder = { id: 'default_folder', name: 'Default Folder', files: [] };
          setFolders([defaultFolder]);
          await AsyncStorage.setItem('folders', JSON.stringify([defaultFolder]));
        }
      } catch (err) {
        console.log(err);
      }
    };
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      setNewFolderName(selectedFolder.name);
    }
  }, [selectedFolder]);

  const toggleGridView = () => {
    setIsGridView(!isGridView);
    setFlatListKey(prevKey => prevKey + 1);
  };
const restoreItems = async () => {
  const restoredItems = trash.filter(t => selectedTrashItems.includes(t.id));
  let updatedFolders = [...folders];

  restoredItems.forEach(item => {
    if (item.type === 'file') {
      updatedFolders = updatedFolders.map(f =>
        f.id === item.fromFolderId ? { ...f, files: [...f.files, item] } : f
      );
    }
    if (item.type === 'folder') {
      updatedFolders = [...updatedFolders, item];
    }
  });

  setFolders(updatedFolders);
  await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));

  const newTrash = trash.filter(t => !selectedTrashItems.includes(t.id));
  setTrash(newTrash);
  await AsyncStorage.setItem('trash', JSON.stringify(newTrash));

  setSelectionMode(false);
  setSelectedTrashItems([]);
};
// delete permanently
const deletePermanently = async () => {
  const newTrash = trash.filter(t => !selectedTrashItems.includes(t.id));
  setTrash(newTrash);
  await AsyncStorage.setItem('trash', JSON.stringify(newTrash));
  setSelectionMode(false);
  setSelectedTrashItems([]);
};
const showAlert = (file) => {
  Alert.alert(
    t('Delete'), // Title
    `Are you sure you want to delete "${file.name}"?`, // Message
    [
      { text: t('Cancel'), style: "cancel" },
      { 
        text: t('Delete'), 
        style: "destructive", 
        onPress: async () => {
          await handleDeleteFile2(file); // delete file and move to trash
        } 
      }
    ],
    { cancelable: false }
  );
};


  const deleteFolder = (id) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
  };

  const handleDelete = async () => {
  if (!selectedFolder) return;
  if (selectedFolder.id === 'default_folder') {
    Alert.alert('Cannot Delete', 'This is a permanent folder.');
    return;
  }

  // move whole folder to trash
  const deletedFolder = { ...selectedFolder, type: 'folder' };
  const newTrash = [...trash, deletedFolder];
  setTrash(newTrash);
  await AsyncStorage.setItem('trash', JSON.stringify(newTrash));

  // then remove it from folders
  const updatedFolders = folders.filter(f => f.id !== selectedFolder.id);
  setFolders(updatedFolders);
  await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));

  setSelectedFolder(null);
  setfolderedit(false);
  setheader(true);
};

useEffect(() => {
  const loadTrash = async () => {
    const savedTrash = await AsyncStorage.getItem('trash');
    if (savedTrash) setTrash(JSON.parse(savedTrash));
  };
  loadTrash();
}, []);


  const handleDeleteFile2 = async (file) => {
  if (!selectedFolder) return;

  // Remove file from folder
  const updatedFiles = selectedFolder.files.filter(f => f.id !== file.id);

  // Add deleted file to trash
  const deletedItem = { ...file, fromFolderId: selectedFolder.id, type: 'file' };
  const newTrash = [...trash, deletedItem];
  setTrash(newTrash);
  await AsyncStorage.setItem('trash', JSON.stringify(newTrash));

  // Update folders array
  const updatedFolders = folders.map(folder => {
    if (folder.id === selectedFolder.id) {
      return { ...folder, files: updatedFiles };
    }
    return folder;
  });

  setFolders(updatedFolders);
  setSelectedFolder({ ...selectedFolder, files: updatedFiles });

  // Save folders
  await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
};

  // Pick a file from device – fixed
  const pickFile = async () => {
    if (!selectedFolder) {
      Alert.alert('No Folder Selected', 'Please select a folder to add a file to.');
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled) {
        console.log('Document picking cancelled.');
        return;
      }

      // new API: get the asset
      const asset = result.assets[0];
      const newFile = {
        id: Date.now().toString(),
        name: asset.name,
        uri: asset.uri
      };

      const updatedFolders = folders.map(folder => {
        if (folder.id === selectedFolder.id) {
          const currentFiles = Array.isArray(folder.files) ? folder.files : [];
          return { ...folder, files: [...currentFiles, newFile] };
        }
        return folder;
      });

      setFolders(updatedFolders);
      // refresh selectedFolder for modal
      const updatedFolder = updatedFolders.find(f => f.id === selectedFolder.id);
      setSelectedFolder(updatedFolder);

      await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
    } catch (err) {
      console.log(err);
    }
  };

  // Render each file in FlatList
// Render each file in FlatList
const renderFile = ({ item }) => (
  <TouchableOpacity
    style={styles.fileItem}
    onPress={() => {
      setSelectedFile(item);
      setFileModalVisible(true);
    }}
    // 👇 The crucial addition
    onLongPress={() => showAlert(item)} 
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

  const handleRenameSave = async () => {
    if (!selectedFolder || newFolderName.trim() === '') {
      Alert.alert('Invalid Name', 'Folder name cannot be empty.');
      return;
    }
    if (selectedFolder.id === 'default_folder') {
      Alert.alert('Cannot Rename', 'This is a permanent folder.');
      return;
    }
    const updatedFolders = folders.map(f =>
      f.id === selectedFolder.id ? { ...f, name: newFolderName } : f
    );
    setFolders(updatedFolders);
    setSelectedFolder({ ...selectedFolder, name: newFolderName });
    setRenameModalVisible(false);
    setfolderedit(false);
    setheader(true);
    await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
  };

  const handleRenameCancel = () => {
    setRenameModalVisible(false);
    setNewFolderName(selectedFolder?.name || '');
  };

  const translations = {
    en: {
      greeting: 'Hello',
      darkMode: 'Dark Mode',
      chooseLanguage: 'Choose Language',
      recentactivity: 'Recent activity',
      Myfiles: 'My files',
      Mypasswords: 'My passwords',
      Mytrashbean: 'My trash bean',
      enterPin: settingPin ? 'Set your PIN' : 'Enter PIN',
      Cancel: 'Cancel',
      Rename: 'Rename',
      Save: 'Save',
      Delete:'Delete',
      Restore:'Restore',
      untitledfolder:'Untitled folder',
      EmptyFolder:'empty folder',
      viewAll:'View all',
      Settings:"Settings",
      Apearence:'Apearence',
      FileManagement:'File Managment',
      Security:'Security & Privacy',
      AboutApp:'About App',
      Talktodevteam:'Contact developer team',
      Help:"Help",
      FAQ:'FAQ',
      Erase:'Clear App Data',
      AcessPin:' App acess Pin',
      SavedPin:'Saved Passwords',
      Lock :'lock',
    
        setFolderPin:'Set a PIN to lock this folder', 
      unlockFolder:'Enter PIN to unlock folder',
      SetPIN:'Set PIN',
      Submit:'Submit',
    },
     fr: {
    greeting: 'Bonjour',
    darkMode: 'Mode sombre',
    chooseLanguage: 'Choisir la langue',
    recentactivity: 'Activité récente',
    Myfiles: 'Mes fichiers',
    Mypasswords: ' mots de passe',
    Mytrashbean: 'Poubelle',
    enterPin: settingPin ? 'Définir votre PIN' : 'Entrez le PIN',
    Cancel: 'Annuler',
    Rename: 'Renommer',
    Save: 'Enregistrer',
    Delete: 'Supprimer',
    Restore: 'Restaurer',
    untitledfolder: 'Dossier sans nom',
    EmptyFolder: 'Dossier vide',
    viewAll: 'Voir tout',
    Settings: 'Paramètres',
    Appearance: 'Apparence',
    FileManagement: 'Gestion de fichiers',
    Security: 'Sécurité et confidentialité',
    AboutApp: "À propos de l'application",
    Talktodevteam: 'Contacter l’équipe de développeurs',
    Help:"Aidé",
    FAQ:'FAQ',
    Erase:'Nettoyer ',
    AcessPin:' App acess Pin',
    SavedPin:'Saved Passwords',
    Lock :'lock',
    setPin:'set a pin to lock this folder',
     setFolderPin:'Définissez un code PIN pour verrouiller ce dossier',
      unlockFolder:"Entrez le code PIN pour déverrouiller le dossier",
      SetPIN:'Définir le code PIN',
      Submit:'Soumettre',
  },
    pt: {
      greeting: 'Olá',
      darkMode: 'Modo escuro',
      chooseLanguage: 'Escolher idioma',
      recentactivity: 'Actividade recente',
      Myfiles: 'Meus arquivos',
      Mypasswords: 'Minhas senhas',
      Mytrashbean: 'Pasta de lixo',
      enterPin: settingPin ? 'Defina seu PIN' : 'Digite o PIN',
      Cancel: 'Cancelar',
      Rename: 'Renomear',
      Save: 'Salvar',
      Delete:'Deletar',
      Restore:'Restourar',
      untitledfolder:'pasta sem nome',
       EmptyFolder:'pasta vazia',
       viewAll:'Ver tudo',
      Settings:"Definições",
      Apearence:'Aparencia',
      FileManagement:'gestão de ficheiros',
      Security:'Segurança & privacidade',
      AboutApp:'Sobre o aplicativo',
      Talktodevteam:'Contactar a equipe de densevolvedores',
      Help:"ajuda",
      FAQ:'FAQ',
      Erase:'Limpar os dados da aplicação',
      AcessPin:' senha de acesso',
      SavedPin:'Senhas guardadas',
      Lock :'blockeiar',
      setPin:'coloque um pin para ,etc',  setFolderPin:'Set a PIN to lock this folder', 
      unlockFolder:'Enter PIN to unlock folder',
      SetPIN:'Set PIN',
      Submit:'Submit',
       setFolderPin:'Defina um PIN para bloquear esta pasta',
      unlockFolder:"Digite o PIN para desbloquear a pasta",
      SetPIN:'Definir PIN',
      Submit:'Enviar',
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
              placeholderTextColor={'blue'}
            />
            <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
              <Text style={styles.buttonText}>{settingPin ? 'Set PIN' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.renameModalContent}>
            <Text style={styles.renameModalTitle}>Rename Folder</Text>
            <TextInput
              style={styles.renameInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Enter new folder name"
              autoFocus={true}
            />
            <View style={styles.renameButtonContainer}>
              <TouchableOpacity style={styles.renameModalButton} onPress={handleRenameCancel}>
                <Text style={styles.renameModalButtonText}>{t('Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.renameModalButton, { backgroundColor: '#007bff' }]} onPress={handleRenameSave}>
                <Text style={[styles.renameModalButtonText, { color: 'white' }]}>{t('Save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* lock Modal */}

// ❌ DELETE the old 'lock Modal' entirely:
// {/* lock Modal */}
// <Modal visible={lockfolder} animationType="slide"
  onRequestClose={()=>setlockfolder(false)}>

 </Modal>


      {/* 🔒 Lock Folder PIN Setting Modal */}
      <Modal visible={lockPinModalVisible} animationType="slide" onRequestClose={() => setLockPinModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitleText}>{t('setFolderPin')}</Text>
            <TextInput
              style={styles.input}
              value={currentFolderPin}
              onChangeText={setCurrentFolderPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="****"
              placeholderTextColor={'blue'}
            />
            <TouchableOpacity style={styles.button} onPress={handleSetFolderPin}>
              <Text style={styles.buttonText}>{t('SetPIN')}</Text>
            </TouchableOpacity>
             <TouchableOpacity 
              style={[styles.button, { marginTop: 10, backgroundColor: '#dc3545' }]} // Red color for cancel
              onPress={() => setLockPinModalVisible(false)}
            >
              <Text style={styles.buttonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    
      <Modal visible={unlockPinModalVisible} animationType="slide" onRequestClose={() => setUnlockPinModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitleText}>{t('unlockFolder')}</Text>
            <TextInput
              style={styles.input}
              value={currentFolderPin}
              onChangeText={setCurrentFolderPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="****"
              placeholderTextColor={'blue'}
            />
            <TouchableOpacity style={styles.button} onPress={handleUnlockFolder}>
              <Text style={styles.buttonText}>{t('Submit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { marginTop: 10, backgroundColor: '#dc3545' }]} // Red color for cancel
              onPress={() => setUnlockPinModalVisible(false)}
            >
              <Text style={styles.buttonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
// ...
      {/* Header */}
      <View style={styles.header}>
        <View style={{
          flexDirection:'row'
        }}>
          <Image
          source={require('./assets/lock.png')} // your local icon path
          style={styles.icon}
        />
       <Text style={styles.appName}>safelocker</Text>
        </View>
        
        <TouchableOpacity style={styles.btnmode} onPress={toggleTheme}>
          <Image source={isDark ? require('./assets/brightness.png') : require('./assets/night-mode.png')} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnflag} onPress={() => setLangModalVisible(true)}>
          <Image source={getFlagSource()} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnsettings} onPress={()=>setsettingsView(true)}>
          <Image source={require('./assets/settings.png')} style={{ width: 20, height: 20 ,tintColor:'black'}} />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.maincontainer}>
        <View style={styles.topview}>
          <TouchableOpacity onPress={() => setmyPasswords(true)}>
            <View style={{
              width: 160, 
              height: 160,
               backgroundColor: '#6A4A99',
                margin: 10, 
                marginTop: 50,
                 borderRadius: 20 
            }}>
              <Image
              source={require('./assets/key.png')}
              style={{width:80,height:80,marginTop:30,marginLeft:40,tintColor:'white'}}
              />
              <Text style={{
                position:'absolute',
                top:115,
                left:10,
                fontSize:20,
                fontWeight:'bold'
                ,color:'black'
              }}>{t('Mypasswords')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setmyFiles(true)}>
            <View style={{
              width: 160, 
              height: 160,
               backgroundColor: '#5CB85C',
                margin: 10, 
                marginTop: 50,
                 borderRadius: 20 
            }}>
               <Image
              source={require('./assets/file.png')}
              style={{width:70,height:70,marginTop:30,marginLeft:40,tintColor:'white'}}
              />
              <Text style={{
                position:'absolute',
                top:115,
                left:20,
                fontSize:20,
                fontWeight:'bold',color:'black'
              }}>{t('Myfiles')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomview}>
          <TouchableOpacity onPress={()=>settrashView(true)}>
            <View style={styles.view2}>
              <Image
              source={require('./assets/recycle-bin.png')}
              style={{width:80,height:80,marginTop:50,marginLeft:55,tintColor:'white'}}
              />
              <Text style={{
                position:'absolute',
                top:20,
                left:40,
                fontSize:20,
                fontWeight:'bold'
              }}>{t('Mytrashbean')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={styles.addview}>
              <Image source={require('./assets/plus3.png')} 
              style={{ width: 100, height: 100, marginTop: 20 }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{
        width:'100%',
        height:320,
        backgroundColor:'#9fa49fff',
        borderTopLeftRadius:40,
        borderTopRightRadius:40,
        marginTop:30,
       
      }}>
        <View style={styles.header}>
 <Text style={{
          fontSize:20,
          fontWeight:'bold',
          marginLeft:20,
          marginTop:10
        }}>{t('recentactivity')}</Text>
        <Text style={{
          fontSize:15,
          fontWeight:'bold',
          marginLeft:80,
          marginTop:15
        }}>{t('viewAll')}</Text>
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
        <Modal onRequestClose={() => setmyFiles(false)}>
          <View style={[styles.FilesView, isDark ? styles.dark : styles.light]}>
            {header && (<View style={styles.filesheader}>
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
              <TouchableOpacity style={styles.btngrid} onPress={toggleGridView}>
                <Image
                  source={require('./assets/visualization.png')}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>)}
            {folderedit && (
              <View style={styles.foldereditView}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginLeft: 20, color: 'white', fontSize: 15, fontWeight: 'bold', flex: 1 }}
                >
                  {selectedFolder?.name}
                </Text>

                  {selectedFolder?.id !== 'default_folder' && (
                  <TouchableOpacity
                    style={styles.renameButton}
                    onPress={() => {
                      // 👇 UPDATED LOGIC HERE
                      setIsSettingNewPin(true);
                      setCurrentFolderPin(selectedFolder.pin || ''); 
                      setLockPinModalVisible(true);
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{t('Lock')}</Text>
                  </TouchableOpacity>
                )}
                {selectedFolder?.id !== 'default_folder' && (
                  <TouchableOpacity
                    style={styles.renameButton}
                    onPress={() => {
                      setRenameModalVisible(true);
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{t('Rename')}</Text>
                  </TouchableOpacity>
                )}

                {/* Delete Button */}
                {selectedFolder?.id !== 'default_folder' && (
                  <TouchableOpacity style={{ marginTop: 17, marginLeft: 20 }} onPress={handleDelete}>
                    <Image
                      source={require('./assets/delete.png')}
                      style={{ width: 20, height: 20 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}


            <View>
              <FlatList
                key={flatListKey}
                data={folders}
                keyExtractor={(item) => item.id}
                numColumns={isGridView ? 2 : 1}
                columnWrapperStyle={isGridView ? styles.row : null}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedFolder(item);
                      if (item.pin) { // Check if the folder has a pin
                        setCurrentFolderPin('');
                        setUnlockPinModalVisible(true); // Show unlock modal
                      } else {
                        setFolderModalVisible(true); // Open folder normally
                      }
                    }}
                    onLongPress={() => {
                      if (item.id === 'default_folder') {
                        Alert.alert('Cannot Modify', 'This is a permanent folder.');
                      } else {
                        setSelectedFolder(item);
                        setheader(false);
                        setfolderedit(true);
                      }
                    }}
                    style={isGridView ? styles.folderGridItem : styles.folderItem}
                  >
                    <View>
                      <Text style={{ textAlign: 'center' ,color:'#FFD580'}}>{item.name}</Text>
                      {item.pin && ( // 🔑 Visual cue for a locked folder
                         <Image
                          source={require('./assets/lock.png')}
                          style={{ width: 15, height: 15, position: 'absolute', right: 5, top: 5, tintColor: '#FFD580' }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>

          </View>
        </Modal>
      )}

      {/* The modal that shows files in a folder */}
      <Modal visible={folderModalVisible} animationType="slide" onRequestClose={() => setFolderModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.foldermodalContainer}>
            <Text style={styles.modalTitleText}>{selectedFolder?.name}</Text>
            <FlatList
              data={selectedFolder?.files || []}
              keyExtractor={(item) => item.id}
              renderItem={renderFile}
              ListEmptyComponent={<Text style={{fontStyle:'italic',color:'#FFD580'}}>{t('EmptyFolder')}</Text>}
              style={{marginLeft:10}}
            />
            <TouchableOpacity style={styles.btnadd} onPress={pickFile}>
              <Image 
              source={require('./assets/add.png')}
              style={{width:50,height:50}}
              />
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>

      {setttingsView&&(
        <Modal
        onRequestClose={()=>setsettingsView(false)}>
          <View style={[styles.container, isDark ? styles.dark : styles.light]}>
            <View style={{
              flexDirection:'row',
             
            }}>
             
   <Text style={{
              marginLeft:20,
              fontSize:25,
              fontWeight:'bold',
              marginTop:20,
              color:'orange'

            }}>{t('Settings')}</Text>

<TouchableOpacity style={{
  marginLeft:170,
  marginTop:25
}}>
  <Image 
  source={require('./assets/letter.png')}
  style={{
    width:20,
    height:20
  }}/>
</TouchableOpacity>
            </View>
         
         {toglehide&&(
          
          <View style={{
              width:'100%',
              marginTop:30,
              alignSelf:'center',
              
              
            }}>
               <TouchableOpacity style={{
                 width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setApearence(true)}>
                 <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
            padding:10,
            color:'#FFD580'
           }}>{t('Apearence')}</Text>
              </TouchableOpacity>

                <TouchableOpacity
                style={{
                 width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setFileManagement(true)}>
                 <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
            padding:10,
             color:'#FFD580'
           }}>{t('FileManagement')}</Text>
              </TouchableOpacity>

               <TouchableOpacity
               style={{
                width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setSecurity(true)}>
                  <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10,
              color:'#FFD580'
           }}>{t('Security')}</Text>
              </TouchableOpacity>

               <TouchableOpacity
               style={{
                 width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setAboutApp(true)}>
                  <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10,
              color:'#FFD580'
           }}>{t('AboutApp')}</Text>
              </TouchableOpacity>
          
           <TouchableOpacity
           style={{
                width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setContactDev(true)}>
                 <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10,
              color:'#FFD580'
           }}>{t('Talktodevteam')}</Text>
          
              </TouchableOpacity>
               <TouchableOpacity
           style={{
                width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setHelp(true)}>
                 <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10,
              color:'#FFD580'
           }}>{t('Help')}</Text>
          
              </TouchableOpacity>

               <TouchableOpacity
           style={{
                width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setFaq(true)}>
                 <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10,
              color:'#FFD580'
           }}>{t('FAQ')}</Text>
          
              </TouchableOpacity>

               <TouchableOpacity
           style={{
                width:'90%',
                 backgroundColor:'darkgray',
                borderRadius:10,
                marginTop:10,
                alignSelf:'center'
                
               }}
               onPress={()=>setClearData(true)}>
                 <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10,
              color:'#FFD580'
           }}>{t('Erase')}</Text>
          
              </TouchableOpacity>
          
          
          
          
         
            </View>
         )}
            
       
          </View>

        </Modal>
      )}
      {/* Modal that shows a single file */}
<Modal
  visible={fileModalVisible}
  animationType="slide"
  onRequestClose={() => setFileModalVisible(false)}
>
  {/* full-screen container */}
  <View style={{ flex: 1, backgroundColor: 'black' }}>
    {selectedFile?.uri &&
    selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
      <RNImage
        source={{ uri: selectedFile.uri }}
        style={{ flex: 1, width: '100%', height: '100%',alignSelf:'center' }}
        resizeMode="contain" // cover = fill entire screen, maintain aspect ratio
      />
    ) : (
      <Text style={{ color: 'white', margin: 20 }}>
        File URI: {selectedFile?.uri}
      </Text>
    )}

    {/* Close button floating over the image */}
    <TouchableOpacity
      onPress={() => setFileModalVisible(false)}
      style={{
        position: 'absolute',
        top: 40, // adjust for status bar
        right: 20,
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: 'black', fontSize: 16 }}>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>

{trashView && (
  <Modal onRequestClose={() => settrashView(false)}>
    <View style={styles.trashview}>
      <View style={{
        width:'100%',
        height:30,
        flexDirection:'row',
        marginTop:20
      }}>
        <Text style={{ marginLeft: 20, fontSize: 20, fontWeight: 'bold' }}>
         {t('Mytrashbean')}
        </Text>
        <TouchableOpacity
        style={{
          marginLeft:170,
          marginTop:5
        }}
       onPress={() => {
  setIsGrid(prev => !prev);
  setFlatListKey(prev => prev + 1);
}}
>
          <Image
          source={require('./assets/column.png')}
          style={{width:20,height:20}}
          />
        </TouchableOpacity>
      </View>
<View style={[styles.maintrashcontainer, isDark ? styles.dark : styles.light]}>
 <FlatList
  key={flatListKey} // forces re-render when layout changes
  data={trash}
  keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
  numColumns={isGrid ? 2 : 1}
  columnWrapperStyle={isGrid ? { justifyContent: 'space-between', marginBottom: 10, alignSelf:'center'} : null}
  renderItem={({ item }) => {
    const isSelected = selectedTrashItems.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.trashItem,
          isGrid && { width: '55%' },
          isSelected && {
            marginLeft:0,
            height:70,
            maxWidth:150,
            marginTop:10,
            backgroundColor:'#ba7a7aff',
            borderRadius:10,
            padding:10
          }
        ]}
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            setSelectedTrashItems([item.id]);
          }
        }}
        onPress={() => {
          if (selectionMode) {
            if (isSelected) {
              setSelectedTrashItems(selectedTrashItems.filter(id => id !== item.id));
            } else {
              setSelectedTrashItems([...selectedTrashItems, item.id]);
            }
          }
        }}
      >
        <Text style={{ color: 'white' }}>
          {item.name || 'Unnamed'} ({item.type || 'unknown'})
        </Text>
      </TouchableOpacity>
    );
  }}
/>

</View>

     

      {selectionMode && (
        <View style={styles.actionHeader}>
          <TouchableOpacity onPress={restoreItems}>
            <Text style={{
              color:'green',
              fontSize:20,
              fontWeight:'bold'

            }}>{t('Restore')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deletePermanently}>
            <Text style={{
              color:'red',fontSize:20,fontWeight:'bold'
            }}>{t('Delete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectionMode(false);
              setSelectedTrashItems([]);
            }}
          >
            <Text style={{
              color:'white',fontSize:20,fontWeight:'bold',
            }}>{t('Cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </Modal>
)}



{myPasswords&&(
  <Modal onRequestClose={()=>setmyPasswords(false)}>
    <View style={[styles.PasswordsViewcontainer, isDark ? styles.dark : styles.light]}>
      <View style={{
        width:'100%',
        height:30,
        flexDirection:'row',
        marginTop:30
      }}>
        <Text
        style={{
          marginLeft:20,
         
          fontWeight:'bold',
          fontSize:20
        }}>{t('Mypasswords')}</Text>
         
        <TouchableOpacity style={{ marginTop: 5, marginLeft: 150 }} >
                    <Image
                      source={require('./assets/wallet.png')}
                      style={{ width: 25, height: 25,tintColor:'white' }}
                    />
        </TouchableOpacity>
        
      </View>

      <View style={{
        width:'100%',
        height:'100%',
        
      }}>

        <TouchableOpacity onPress={()=>setAcessPin(true)}>
          <View style={{
            width:'90%',
            height:100,
            backgroundColor:'lightgray',
            alignSelf:'center',
            borderRadius:20,
            marginTop:150
          }}>
            <Text style={{
              marginLeft:20,
              marginTop:10,
              fontSize:15,
              fontWeight:'bold'
            }}>{t('AcessPin')}</Text>

            <TextInput
             placeholder='* * * *'
             placeholderTextColor='red'
             editable={false}
             
             style={{
             width:150,
             height:80,
             borderRadius:10,
             alignSelf:'center',
             fontSize:50,
             marginTop:0,
             
             
             color:'red',fontWeight:'bold'}}/>
             <TouchableOpacity
             style={{
              marginLeft:280,
              marginTop:-65
             }}>
              <Image
              source={require('./assets/view.png')}
              style={{width:30,height:30}}
              />
             </TouchableOpacity>

          </View>
        </TouchableOpacity>

       <TouchableOpacity onPress={()=>setSavedPin(true)}>
          <View style={{
            width:'90%',
            height:100,
            backgroundColor:'lightgray',
            alignSelf:'center',
            borderRadius:20,
            marginTop:20
          }}>
            <Text style={{
              marginLeft:20,
              marginTop:25,
              fontSize:30,
              fontWeight:'bold'
            }}>{t('SavedPin')}</Text>

           
             <TouchableOpacity
             style={{
              marginLeft:280,
              marginTop:-35
             }}>
              <Image
              source={require('./assets/save-instagram.png')}
              style={{width:30,height:30}}
              />
             </TouchableOpacity>

          </View>
        </TouchableOpacity>


 <TouchableOpacity style={styles.btnpassword} onPress={()=>setPin(true)}>
        <Image
        source={require('./assets/spanner.png')}
        style={{
          width:40,
          height:40
        }}/>
      </TouchableOpacity>
      </View>
     
    </View>
  </Modal>
)}

{file&&(
  <Modal transparent
  onRequestClose={()=>setfile(false)}>
    <View style={{
   
      width:'100%',
      height:50,
      backgroundColor:'darkgray',
      marginTop:0,
      flexDirection:'row',
      

    }}>
       <TouchableOpacity style={{
        marginLeft:40,
        marginTop:20
       }}>
        <Image 
        source={require('./assets/info.png')}
        style={{width:20,height:20}}/>
      </TouchableOpacity>
       <TouchableOpacity
        style={{
        marginLeft:40,
        marginTop:20
       }}>
        <Image 
        source={require('./assets/copy.png')}
        style={{width:20,height:20}}/>
      </TouchableOpacity>
       <TouchableOpacity
        style={{
        marginLeft:40,
        marginTop:20
       }}>
        <Image 
        source={require('./assets/star.png')}
        style={{width:20,height:20}}/>
      </TouchableOpacity>
       <TouchableOpacity
        style={{
        marginLeft:40,
        marginTop:20
       }}
       onPress={() => showAlert(item)}>
        <Image 
        source={require('./assets/download.png')}
        style={{width:20,height:20}}/>
      </TouchableOpacity>
       <TouchableOpacity
       style={{
        marginLeft:40,
        marginTop:20
       }}
         onPress={() => {
    if (selectedFile) {
      handleDeleteFile2(selectedFile);  // directly delete the file
      setfile(false);                  // close the modal toolbar if needed
      setFileModalVisible(false);      // close the file preview modal
    }
  }}>
        <Image 
        source={require('./assets/delete.png')}
        style={{width:20,height:20}}/>
      </TouchableOpacity>
      <TouchableOpacity
       style={{
        marginLeft:40,
        marginTop:20
       }}>
        <Image 
        source={require('./assets/share2.png')}
        style={{width:20,height:20}}/>
      </TouchableOpacity>

    </View>
  </Modal>
)}

{Pin&&(
  <Modal
  transparent
  animationType='fade'
  onRequestClose={()=>setPin(false)}>
    <View style={{
      width:'80%',
      height:400,
      backgroundColor:'gray',
      alignSelf:'center',
      marginTop:100,
      borderRadius:20

    }}>



<View style={{
  width:'60%',
  alignSelf:'center',
  height:150,
  marginTop:100,
  backgroundColor:'lightgray',
  borderRadius:10,
  padding:20
}}>


  <Text style={{
    width:130,
    height:40,
    fontStyle:'italic',
    fontSize:15,
    alignSelf:'center'
  }}>Current Password</Text>
</View>
      <Text style={{
        fontSize:20,
        fontWeight:"bold",
        marginTop:20,
        alignSelf:'center',
        backgroundColor:'#3084a3ff',
        padding:10,
        borderRadius:10
      }}>Set a new Password</Text>
         <Text style={{
        fontSize:20,
        fontWeight:"bold",
        marginTop:20,
        alignSelf:'center',
        backgroundColor:'#5d735dff',
        padding:10,
        borderRadius:10
      }}>manage my Passwords</Text>

    </View>
  </Modal>
)}

//my settings boxes
{apearence&&(
  <Modal
  onRequestClose={()=>setApearence(false)}
  transparent>
    <View style={styles.modalboxview}>
      <Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
        marginTop:20,
         color:'#FFD580'
      }}>Apearence</Text>

<TouchableOpacity onPress={()=>setTheme(true)}>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Theme</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>

<TouchableOpacity onPress={()=>setfont(true)}>
     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Font & text size</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />

</TouchableOpacity>

  <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Animation </Text>
       <Switch
     
      style={{width:20,height:20,marginTop:-21,marginLeft:300}}
      />


   
      
      
    </View>
  </Modal>
)}

{fileManagament&&(
  <Modal
  transparent
   onRequestClose={()=>setFileManagement(false)}>
    <View style={styles.modalboxview}>
       <Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
        marginTop:20,
         color:'#FFD580'
      }}>File Management</Text>


      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Sort & filter preferences</Text>
      <Switch
     
      style={{width:20,height:20,marginTop:-23,marginLeft:300}}
      />


<TouchableOpacity onPress={()=>setTheme(true)}>
     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Backup & restore</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />

</TouchableOpacity>

  <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>File auto-lock</Text>
      <Switch
     
      style={{width:20,height:20,marginTop:-23,marginLeft:300}}
      />


    </View>
  </Modal>
)}

{security&&(
  <Modal
  transparent
   onRequestClose={()=>setSecurity(false)}>
    <View style={styles.modalboxview}>
       <Text style={{
        fontWeight:'bold',
        fontSize:20,
        textAlign:'center',
        marginTop:20,
         color:'#FFD580'
      }}>Security & Privacy</Text>

<TouchableOpacity onPress={()=>setTheme(true)}>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Authentication type</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>


     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Auto-lock timer</Text>
      <Switch
     
      style={{width:20,height:20,marginTop:-25,marginLeft:300}}
      />



  <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Two-step unlock</Text>
      <Switch
     
      style={{width:20,height:20,marginTop:-25,marginLeft:300}}
      />

    </View>
  </Modal>
)}


{aboutApp&&(
  <Modal
  transparent
   onRequestClose={()=>setAboutApp(false)}>
    <View style={styles.modalboxview}>
  <Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
       marginTop:30,
       color:'#FFD580'
        
      }}>About App</Text>

<TouchableOpacity onPress={()=>setappVersion(true)}>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>App version</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>

<TouchableOpacity onPress={()=>setDevInfo(true)}>
     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Developer info</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />

</TouchableOpacity>
<TouchableOpacity onPress={()=>setPrivacyPolicy(true)}>
  <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Privacy policy</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>
    </View>
  </Modal>
)}

{contactDev&&(
  <Modal
  transparent
   onRequestClose={()=>setContactDev(false)}>
    <View style={styles.modalboxview}>
<Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
         marginTop:30,
         color:'#FFD580'
      
      }}>Contact Dev Team</Text>

<TouchableOpacity>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Contact form</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>

<TouchableOpacity>
     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
       marginTop:30,
        height:25,
        color:'white'
      }}>Support email</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />

</TouchableOpacity>
<TouchableOpacity>
  <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Socials / community</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>
    </View>
  </Modal>
)}

{help&&(
  <Modal
  transparent
   onRequestClose={()=>setHelp(false)}>
    <View style={styles.modalboxview}>
 <Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
        marginTop:20,
         color:'#FFD580'
      }}>Help</Text>

<TouchableOpacity onPress={()=>setTheme(true)}>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Quick start guide</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>

<TouchableOpacity onPress={()=>setTheme(true)}>
     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Troubleshooting</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />

</TouchableOpacity>

    </View>
  </Modal>
)}


{faq&&(
  <Modal
  transparent
   onRequestClose={()=>setFaq(false)}>
    <View style={styles.modalboxview}>
  <Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
        marginTop:20,
         color:'#FFD580'
      }}>FAQ</Text>

<TouchableOpacity>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Quick start guide</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>
    </View>
  </Modal>
)}

{clearData&&(
  <Modal
  transparent
   onRequestClose={()=>setClearData(false)}>
    <View style={styles.modalboxview}>
 <Text style={{
        fontWeight:'bold',
        fontSize:25,
        textAlign:'center',
        marginTop:20,
         color:'#FFD580'
      }}>Clear App Data</Text>

<TouchableOpacity>
      <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Clear cache</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>

<TouchableOpacity>
     <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
        marginTop:30,
        height:25,
        color:'white'
      }}>Clear all files</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />

</TouchableOpacity>
<TouchableOpacity>
  <Text
      style={{
        
        fontSize:20,
        marginLeft:50,
         marginTop:30,
        height:25,
        color:'white'
      }}>Reset settings</Text>
      <Image
      source={require('./assets/next.png')}
      style={{width:17,height:17,marginTop:-20,marginLeft:300}}
      />
</TouchableOpacity>
    </View>
  </Modal>
)}
{theme&&(
  <Modal
  transparent
  onRequestClose={()=>setTheme(false)}>
    <View style={{
      width:350,
      height:170,
      backgroundColor:'#dee7c1ff',
      alignSelf:'center',
      marginTop:200,
      borderRadius:10
    }}>
<TouchableOpacity onPress={()=>setTheme(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:17,
    height:17,
    marginTop:20,
    marginLeft:15

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
        marginTop:20
      }}>night mode </Text>
       <Switch style={{
        marginTop:-40,
        marginRight:20
      }} />
      
     
      <Text
       style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
         marginTop:20,
        
      }}>contrast color </Text>
      <Switch style={{
        marginTop:-40,
         marginRight:20
      }} />




    </View>

  </Modal>
)}

{font&&(
  <Modal
  transparent
  onRequestClose={()=>setfont(false)}>
  <View style={{
      width:350,
      height:170,
      backgroundColor:'#dee7c1ff',
      alignSelf:'center',
      marginTop:200,
      borderRadius:10
    }}>
<TouchableOpacity onPress={()=>setfont(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:17,
    height:17,
    marginTop:20,
    marginLeft:15

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
        marginTop:20
      }}>night mode </Text>
       <Switch style={{
        marginTop:-40,
        marginRight:20
      }} />
      
     
      <Text
       style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
         marginTop:20,
        
      }}>contrast color </Text>
      <Switch style={{
        marginTop:-40,
         marginRight:20
      }} />




    </View>
  </Modal>
)}


{backup&&(
  <Modal
  transparent
  onRequestClose={()=>setBackup(false)}>
  <View style={{
      width:350,
      height:170,
      backgroundColor:'#dee7c1ff',
      alignSelf:'center',
      marginTop:200,
      borderRadius:10
    }}>
<TouchableOpacity onPress={()=>setTheme(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:17,
    height:17,
    marginTop:20,
    marginLeft:15

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
        marginTop:20
      }}>night mode </Text>
       <Switch style={{
        marginTop:-40,
        marginRight:20
      }} />
      
     
      <Text
       style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
         marginTop:20,
        
      }}>contrast color </Text>
      <Switch style={{
        marginTop:-40,
         marginRight:20
      }} />




    </View>
  </Modal>
)}

{authentication&&(
  <Modal
  transparent
  onRequestClose={()=>setAuthentication(false)}>
 <View style={{
      width:350,
      height:170,
      backgroundColor:'#dee7c1ff',
      alignSelf:'center',
      marginTop:200,
      borderRadius:10
    }}>
<TouchableOpacity onPress={()=>setTheme(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:17,
    height:17,
    marginTop:20,
    marginLeft:15

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
        marginTop:20
      }}>night mode </Text>
       <Switch style={{
        marginTop:-40,
        marginRight:20
      }} />
      
     
      <Text
       style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
         marginTop:20,
        
      }}>contrast color </Text>
      <Switch style={{
        marginTop:-40,
         marginRight:20
      }} />




    </View>
  </Modal>
)}

{lockTimer&&(
  <Modal
  transparent
  onRequestClose={()=>setLockTimer(false)}>
 <View style={{
      width:350,
      height:170,
      backgroundColor:'#dee7c1ff',
      alignSelf:'center',
      marginTop:200,
      borderRadius:10
    }}>
<TouchableOpacity onPress={()=>setTheme(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:17,
    height:17,
    marginTop:20,
    marginLeft:15

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
        marginTop:20
      }}>night mode </Text>
       <Switch style={{
        marginTop:-40,
        marginRight:20
      }} />
      
     
      <Text
       style={{
        marginLeft:50,
        fontWeight:'bold',
        fontSize:20,
         marginTop:20,
        
      }}>contrast color </Text>
      <Switch style={{
        marginTop:-40,
         marginRight:20
      }} />




    </View>
  </Modal>
)}

{AcessPin && (
  <Modal
    transparent
    animationType="fade"
    onRequestClose={() => setAcessPin(false)}
  >
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      marginTop: -145
    }}>
      <View style={{
        backgroundColor: 'gray',
        height: 240,
        width: '90%',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
      }}>
        <Text style={{
          textAlign: 'center',
          marginTop: 30,
          fontSize: 20,
          fontWeight: 'bold'
        }}>
          Current Password:
        </Text>

        {/* Password box inside the modal */}
        <View style={{
          width: 200,
          height: 70,
          borderRadius: 10,
          marginTop: 50,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: '#fff'
        }}>
          <Text style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: 'black'
          }}>
            {hide ? '****' : storedPin}
          </Text>

          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 10
            }}
            onPress={() => setHide(!hide)} // toggle hide state
          >
            <Image
              source={
                hide
                  ? require('./assets/view.png') // eye icon
                  : require('./assets/hide.png') // crossed eye icon
              }
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}



{SavedPin&&(
  <Modal
  transparent
  onRequestClose={()=>setSavedPin(false)}>
<View style={{
  flex:1,
  width:'100%',
  backgroundColor:'white'
  

}}>
  <Text 
  style={{
    fontSize:20,
    marginLeft:20,
    marginTop:20,
    fontWeight:'bold'
  }}>Saved Passords</Text>
  

</View>
  </Modal>
)}

{appversion&&(
  <Modal
  transparent
  onRequestClose={()=>setTheme(false)}>
    <View style={{
      width:350,
      height:170,
      backgroundColor:'#dee7c1ff',
      alignSelf:'center',
      marginTop:200,
      borderRadius:10
    }}>

<TouchableOpacity onPress={()=>setappVersion(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:17,
    height:17,
    marginTop:20,
    marginLeft:15

  }}
  />
</TouchableOpacity>
      
     
  <Text style={{
    textAlign:'center',
    marginTop:20,
    fontSize:20,
    fontWeight:'bold'
  }}>App version</Text>
  <Text style={{
    textAlign:'center',
    marginTop:20,
    fontSize:20,
    fontWeight:'bold'
  }}>1.0</Text>




    </View>

  </Modal>
)}

{devinfo&&(
  <Modal onRequestClose={()=>setDevInfo(false)}>
    <View style={{
      flex:1,
      backgroundColor:'#dee7c1ff',
    }}>

      <TouchableOpacity onPress={()=>setDevInfo(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:20,
    height:20,
    marginTop:20,
    marginLeft:20

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginTop:-25,
        textAlign:'center',
        fontWeight:'bold',
        fontSize:20
      }}>Developer Info</Text>
       <Text style={{
        marginTop:20,
        textAlign:'center',
        fontWeight:'bold',
        fontSize:17
      }}>who am I?</Text>
        <Text>Name:Armando Júnior</Text>
         <Text> i am a passionate Mobile developer with proven
           experience in building productivity based mobile apps</Text>

            <Text style={{
        marginTop:20,
        textAlign:'center',
        fontWeight:'bold',
        fontSize:17
      }}>How to find me?</Text>
    </View>
  </Modal>
)}
{privacypolicy&&(
  <Modal onRequestClose={()=>setPrivacyPolicy(false)}>
    <View style={{
      flex:1,
      backgroundColor:'#dee7c1ff',
    }}>

      <TouchableOpacity onPress={()=>setDevInfo(false)}>
  <Image 
  source={require('./assets/back.png')}
  style={{
    width:20,
    height:20,
    marginTop:20,
    marginLeft:20

  }}
  />
</TouchableOpacity>
      <Text style={{
        marginTop:-25,
        textAlign:'center',
        fontWeight:'bold',
        fontSize:20
      }}>Privacy & policy</Text>
       <Text style={{
        marginTop:20,
        textAlign:'center',
        fontWeight:'bold',
        fontSize:17
      }}>who am I?</Text>
        <Text>Name:Armando Júnior</Text>
         <Text> i am a passionate Mobile developer with proven
           experience in building productivity based mobile apps</Text>

            <Text style={{
        marginTop:20,
        textAlign:'center',
        fontWeight:'bold',
        fontSize:17
      }}>How to find me?</Text>
    </View>
  </Modal>
)}



    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    dark: { backgroundColor: '#1A1A2E' },
    light: { backgroundColor: '#E0F0FF' },
    header: { position: 'absolute', top: 20, width: '100%', height: 45, flexDirection: 'row', gap: 20 },
    appName: { fontSize: 30, fontWeight: 'bold', color: 'orange', },
    btnmode: { marginLeft: 20, marginTop: 12 },
    btnflag: { marginLeft: 10, marginTop: 12 },
    btnsettings: { marginLeft: 10, marginTop: 12,tintColor:'white' },
    maincontainer: { width: '100%', height: 450, marginTop: 100, borderRadius: 20 ,marginLeft:20},
    topview: { flexDirection: 'row', width: '100%' },
    bottomview: { flexDirection: 'row' },
    view: { width: 150, height: 150, backgroundColor: '#6A4A99', margin: 10, marginTop: 50, borderRadius: 20 },
    view2: { width: 200, height: 160, backgroundColor: '#F2994A', margin: 10, marginTop: 50, borderRadius: 20 },
    addview: { width: 100, height: 150, margin: 10, marginTop: 50, borderRadius: 10 },
    footerView: { position: 'absolute', bottom: 0, width: '100%', height: 250, backgroundColor: 'lightgreen', borderTopLeftRadius: 20, borderTopRightRadius: 20 },

    modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
    modalTitleText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 ,marginLeft:20,marginTop:20},
    input: { width: '60%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, textAlign: 'center', fontSize: 25, marginBottom: 20, color: 'green' },
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
        flexDirection: 'row',
        marginTop: 20
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
        flex: 1,
        height: 60, width: '100%'
    },
    fileItem: {
        padding: 10,
        marginTop: 20,
        marginLeft:20,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        width:'80%',
        height:50,
    },
    fileText: {
        fontSize: 16,
    },
    foldereditView: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'space-around', // Aligns children with space between them
        paddingHorizontal: 10
    },
    renameInput: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    // New styles for the rename modal
    renameModalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    renameModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    renameButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    renameModalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    renameModalButtonText: {
        fontSize: 16,
        color: 'black',
    },
    renameButton: {

        padding: 10,
        borderRadius: 5,
        marginLeft: 20,
        marginTop: 10,

    },
    // This is the new style to make the grid view look good
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    // This is the new style for each folder item in grid view
    folderGridItem: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    // This is the original style for each folder item in list view
    folderItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        width: '50%',
        height: 40,
        marginLeft: 20,
        marginTop: 10,
    },
    btnadd: {
        width: 40,
        height: 40,
        position: 'absolute',
        bottom: 30,
        right: 30
    },
      icon: {
    width: 30,
    height: 25,
    marginHorizontal: 2, 
    marginTop:8,
    marginLeft:20,
    tintColor:'white'
  },
  filemodalContainer:{
    width:'100%',
    height:400
  },
  trashview:{
    width:'100%',
    height:'100%',
    backgroundColor:'#d3e7d3ff'
  },
  maintrashcontainer:{
    width:'100%',
    height:'100%',
    backgroundColor:'gray',
    marginTop:0

  },
  trashItem:{
    marginLeft:20,
    height:70,
    maxWidth:150,
    marginTop:10,
    backgroundColor:'darkgray',
    borderRadius:10,
    padding:10
   
  },
  actionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: 50,
  backgroundColor: '#d3e7d3ff',
  position:'absolute',
  top:10,
  width:'100%'
},
actionText: {
  color: 'white',
  fontSize: 20,
  fontStyle:'italic',
  backgroundColor:'red'
},
btnpassword:{
 position:'absolute',
 bottom:200,
 right:50

},
modalboxview:{
  width:'90%',
  height:500,
  backgroundColor:'darkgray',
  alignSelf:'center',
  marginTop:200,
  borderRadius:15
}
    
});