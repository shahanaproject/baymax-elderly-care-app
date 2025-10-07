/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProtectorHome from './src/screens/ProtectorHome';
import ParentHome from './src/screens/ParentHome';
import Goals from './src/screens/Goals'; // Import the Goals
import Activity from './src/screens/Activity'; // Import the Activity page
import HealthRecordsScreen from './src/screens/HealthRecordsScreen'; // Import the Healthrecordscreen page
import Emergency from './src/screens/Emergency';
import HospitalHome from './src/screens/HospitalHome';
import HospitalHealthRecord from './src/screens/HospitalHealthRecord';
import EmergencyPageElder from './src/screens/EmergencyPageElder';

import {
  isUserLoggedIn,
  setItem,
  getItem,
  storageEmitter,
} from './src/utils/storage';
import auth from '@react-native-firebase/auth';
import {OneSignal} from 'react-native-onesignal';
import NotificationModal from './src/components/NotificationModal';
import ElderlyHome from './src/screens/ElderlyHome';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfile from './src/screens/EditProfile';


const Stack = createStackNavigator();


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [notificationData, setNotificationData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isUserLoggedIn();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const role = await getItem('userRole');
        setUserRole(role);
      }
    };
    checkLoginStatus();


    const loginListener = storageEmitter.addListener(
      'isLoggedInChanged',
      async value => {
        const loggedIn = value === 'true';
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          const role = await getItem('userRole');
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      },
    );


    return () => {
      loginListener.remove();
    };
  }, []);


  const handleLogout = async () => {
    try {
      await auth().signOut();
      OneSignal.logout();
      await setItem('isLoggedIn', 'false');
      await setItem('userRole', '');
      setIsLoggedIn(false);
      setUserRole(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };


  useEffect(() => {
    if (typeof OneSignal !== 'undefined') {
      OneSignal.initialize('347b5775-8057-45e0-b189-a252145160b7');
      OneSignal.Notifications.requestPermission(true);


      OneSignal.Notifications.addEventListener(
        'foregroundWillDisplay',
        event => {
          setNotificationData(event.notification);
          setModalVisible(true);
        },
      );
      setTimeout(() => {
        OneSignal.Notifications.addEventListener('click', event => {
          setNotificationData(event.notification);
          setModalVisible(true);
        });
      }, 3000);
    } else {
      console.error('OneSignal is undefined.');
    }
  }, []);


  const HeaderComponent = ({title}) => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );


  if (isLoggedIn === null || (isLoggedIn && !userRole)) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          userRole === 'Protector' ? (
            <>
              <Stack.Screen
                name="ProtectorHome"
                component={ProtectorHome}
                options={{
                  header: () => <HeaderComponent title="Protector Home" />,
                }}
              />
              <Stack.Screen
                name="Goals"
                component={Goals} // Add the Goals page here
                options={{
                  header: () => <HeaderComponent title="Goals" />,
                }}
              />
              <Stack.Screen
                name="Activity"
                component={Activity} // Add the Activity page here
                options={{
                  header: () => <HeaderComponent title="Activity" />,
                }}
              />
              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen} // Add the profile page here
                options={{
                  header: () => <HeaderComponent title="Profile" />,
                }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfile} // Add the ediprofile page here
                options={{
                  header: () => <HeaderComponent title="Edit" />,
                }}
              />
              <Stack.Screen
                name="Emergency"
                component={Emergency} // Add the Emergency page here
                options={{
                  header: () => <HeaderComponent title="Emergency" />,
                }}
              />
              <Stack.Screen
                name="HealthRecordsScreen"
                component={HealthRecordsScreen} // Add the HealthRecordsScreen page here
                options={{
                  header: () => <HeaderComponent title="Health Records" />,
                }}
              />
            </>
          ) : userRole === 'Hospitsl' ? (
            <>
              <Stack.Screen
              name="HospitalHome"
              component={HospitalHome} // Add the HospitalHome screen here
              options={{
                header: () => <HeaderComponent title="Hospital Home" />,
              }}
            />
             <Stack.Screen
              name="HospitalHealthRecord"
              component={HospitalHealthRecord} // Add the HospitalHealthRecord screen here
              options={{
                header: () => <HeaderComponent title="Health records" />,
              }}
            />
               <Stack.Screen
                name="ParentHome"
                 component={ParentHome} // Make sure ParentHome is correctly added here
                options={{
               header: () => <HeaderComponent title="Parent Home" />,
              }}
             />


            </>
          ) : (
            <>
            <Stack.Screen
              name="ElderlyHome"
              component={ElderlyHome}
              options={{
                header: () => <HeaderComponent title="Elderly Home" />,
              }}
            />
            <Stack.Screen
            name="ParentHome"
            component={ParentHome}
            options={{
              header: () => <HeaderComponent title="ParentHome" />,
            }}
          />
            <Stack.Screen
             name="EmergencyPageElder" // Ensure this matches the navigation route
             component={EmergencyPageElder}
             options={{
             headerShown: false, // Removes header for emergency page
            }}
            />

          </>
            
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
      <NotificationModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setNotificationData(null);
        }}
        notificationData={notificationData}
        userRole={userRole}
      />
    </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  logoutText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});


export default App;