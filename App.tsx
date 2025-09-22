import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,TouchableOpacity,Image} from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function App() {
   const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('theme');
        if (saved !== null) {
          setIsDark(saved === 'dark');
        }
      } catch (err) {
        console.log('Error loading theme:', err);
      }
    };
    loadTheme();
  }, []);

  // Toggle theme and save it
  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem('theme', newValue ? 'dark' : 'light');
    } catch (err) {
      console.log('Error saving theme:', err);
    }
  };
   
  
  return (
    <View style={[styles.container, isDark ? styles.dark : styles.light]}>
      <View style={styles.header}>
        <Text style={styles.appName}>safelocker</Text>

         <TouchableOpacity style={styles.btnmode} onPress={toggleTheme}
          activeOpacity={0.7}>
          <Image
           source={isDark ? require('./assets/brightness.png') : require('./assets/night-mode.png')}
          style={{width:20,height:20}}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnflag}>
          <Image
          source={require('./assets/united-states.png')}
          style={{width:20,height:20}}/>
        </TouchableOpacity>
         
         <TouchableOpacity style={styles.btnsettings}>
          <Image
          source={require('./assets/settings.png')}
          style={{width:20,height:20}}/>
        </TouchableOpacity>

      </View>

      <View style={styles.maincontainer}>
       <View style={styles.topview}>
       <TouchableOpacity>
          <View style={styles.view}>
            <Text style={styles.text1}>My passwords</Text>

          </View>
        </TouchableOpacity>
         <TouchableOpacity>
          <View style={styles.view}>
           <Text style={styles.text1}>My Files</Text>
          </View>
        </TouchableOpacity>
       </View>
       <View style={styles.bottomview}>
         <TouchableOpacity>
          <View style={styles.view2}>
            

          </View>
        </TouchableOpacity>
         <TouchableOpacity>
          <View style={styles.addview}>
            <Image
         source={require('./assets/add-button.png')}
         style={{width:100,height:100,marginTop:20}}/>

          </View>
        </TouchableOpacity>
       </View>
        
        

      </View>
      <View style={styles.footerView}>
        <Text style={{fontSize:20,
        fontWeight:'bold',
        marginLeft:30,
          marginTop:5
        }}>Added files recently</Text>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
   dark: {
    backgroundColor: '#222',
  },
  light: {
    backgroundColor: '#fff',
  },
  header:{
    position:'absolute',
    top:20,
    width:'100%',
    height:50,
    flexDirection:'row',
    gap:20
    

  },
  appName:{
    fontSize:30,
    fontWeight:'bold',
    color:'orange',
    marginLeft:20

  },
  btnmode:{
    marginLeft:50,
    marginTop:12
  },
  btnflag:{
    marginLeft:10,
    marginTop:12
  },
  btnsettings:{
    marginLeft:10,
    marginTop:12
  },
  maincontainer:{
    width:'90%',
    height:450,
    backgroundColor:'gray',
    marginTop:-150,
    borderRadius:20,
   
   
  },
  topview:{
    flexDirection:'row',
    width:'100%'
  },
  bottomview:{
   flexDirection:'row'
  },
  view:{
    width:150,
    height:150,
    backgroundColor:'darkgray',
    margin:10,
    marginTop:50,
    borderRadius:10

  },
   view2:{
    width:200,
    height:150,
    backgroundColor:'darkgray',
    margin:10,
    marginTop:50,
    borderRadius:10

  },
   addview:{
    width:100,
    height:150,
    margin:10,
    marginTop:50,
    borderRadius:10

  },
  footerView:{
    position:'absolute',
    bottom:0,
    width:'100%',
    height:250,
    backgroundColor:'lightgreen',
    borderTopLeftRadius:20,
    borderTopRightRadius:20
   
  
  },
  text1:{
    fontSize:20,
    fontWeight:'bold',
    color:'white',
    marginTop:50,
    textAlign:'center'
  }
  
});
