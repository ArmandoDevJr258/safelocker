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
  const [flatListKey, setFlatListKey] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
const [fileModalVisible, setFileModalVisible] = useState(false);


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

const showAlert = (file) => {
  Alert.alert(
    "Delete File",
    `Are you sure you want to delete "${file.name}"?`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteFile2(file) }
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
      setSelectedFolder(null);
      setfolderedit(false);
      setheader(true);
      return;
    }

    const updatedFolders = folders.filter(f => f.id !== selectedFolder.id);
    setFolders(updatedFolders);
    setSelectedFolder(null);
    setfolderedit(false);
    setheader(true);
    await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
  };
  const handleDeleteFile2 = async (file) => {
  if (!selectedFolder) return;

  const updatedFiles = selectedFolder.files.filter(f => f.id !== file.id);

  // Update folders array
  const updatedFolders = folders.map(folder => {
    if (folder.id === selectedFolder.id) {
      return { ...folder, files: updatedFiles };
    }
    return folder;
  });

  setFolders(updatedFolders);
  setSelectedFolder({ ...selectedFolder, files: updatedFiles });

  // Save to AsyncStorage
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
const renderFile = ({ item }) => (
  <TouchableOpacity
    style={styles.fileItem}
    onPress={() => {
      setSelectedFile(item);
      setFileModalVisible(true);
    }}
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
      untitledfolder:'Untitled folder',
      EmptyFolder:'empty folder'
    },
    fr: {
      greeting: 'Bonjour',
      darkMode: 'Mode sombre',
      chooseLanguage: 'Choisir la langue',
      recentactivity: 'Recent activity',
      Myfiles: 'Mes fichiers',
      Mypasswords: ' mots de passe',
      Mytrashbean: 'Poubelle',
      enterPin: settingPin ? 'Définir votre PIN' : 'Entrez le PIN',
      Cancel: 'Annuler',
      Rename: 'Renommer',
      Save: 'Enregistrer',
       EmptyFolder:'No files added yet'
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
      untitledfolder:'pasta sem nome',
       EmptyFolder:'pasta vazia'
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
          <Image source={require('./assets/settings.png')} style={{ width: 20, height: 20 ,tintColor:'white'}} />
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
          <TouchableOpacity>
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
        height:300,
        backgroundColor:'#9fa49fff',
        borderTopLeftRadius:40,
        borderTopRightRadius:40,
        marginTop:30,
       
      }}>
        <Text style={{
          fontSize:30,
          fontWeight:'bold',
          marginLeft:20,
          marginTop:10
        }}>{t('recentactivity')}</Text>
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
          <View style={styles.FilesView}>
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
                      setFolderModalVisible(true);
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
                      <Text style={{ textAlign: 'center' }}>{item.name}</Text>
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
              ListEmptyComponent={<Text style={{fontStyle:'italic'}}>{t('EmptyFolder')}</Text>}
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
          <View>
            <View style={{
              
            }}>
   <Text style={{
              marginLeft:20,
              fontSize:25,
              fontWeight:'bold',
              marginTop:20

            }}>Settings</Text>

            </View>
         
            <View style={{
              marginTop:200,
              marginLeft:20
            }}>
                <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
            padding:10
           }}>Apearence</Text>
           <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
            padding:10
           }}>File managment</Text>
            <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10
           }}>security & privacy</Text>
            <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10
           }}>About app</Text>
          <Text style={{
            fontSize:20,
            fontWeight:'bold',
            marginLeft:40,
             padding:10
           }}>Contact developer team</Text>
          
            </View>
       
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


    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    dark: { backgroundColor: '#1A1A2E' },
    light: { backgroundColor: '#fff' },
    header: { position: 'absolute', top: 20, width: '100%', height: 45, flexDirection: 'row', gap: 20 },
    appName: { fontSize: 30, fontWeight: 'bold', color: 'orange', },
    btnmode: { marginLeft: 20, marginTop: 12 },
    btnflag: { marginLeft: 10, marginTop: 12 },
    btnsettings: { marginLeft: 10, marginTop: 12,tintColor:'white' },
    maincontainer: { width: '100%', height: 450, marginTop: 40, borderRadius: 20 ,marginLeft:20},
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
  }
    
});