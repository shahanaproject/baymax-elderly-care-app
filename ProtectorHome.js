import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { setItem } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import NotifyParentModal from '../components/NotifyParentModal';

const ProtectorHome = () => {
  const navigation = useNavigation();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showReminder, setShowReminder] = useState(false);
  const [selectedMember, setSelectedMember] = useState(false);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const user = auth().currentUser;
      const snapshot = await firestore()
        .collection('users')
        .where('protectorId', '==', user.uid)
        .get();

      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFamilyMembers(members);
    };

    fetchFamilyMembers();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setItem('isLoggedIn', 'false');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Tasks for today
  const tasksForToday = [
    'Go for a walk',
    'Read a book for 30 minutes',
    'Call a friend or family member',
  ];
  const navigateToHealthRecords = (userId, email) => {
    navigation.navigate('HealthRecordsScreen', {
      userId,
      email,
    });
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#e0f7fa' }}>
      {/* Background Image */}
      <Image source={require('../screens/assets/background.jpg')} style={styles.backgroundImage} />

      {/* Grid Layout for Buttons */}
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('Goals')} // Change "Home" to "Goals"
        >
          <Text style={styles.gridText}>Goals</Text> {/* Change "Home" to "Goals" */}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.gridText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.gridItem}
  onPress={() => navigation.navigate('Activity')}  // Use the correct name of the screen here
>
  <Text style={styles.gridText}>Activity</Text>
</TouchableOpacity>


        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => familyMembers.length > 0 && 
            navigateToHealthRecords(familyMembers[0].id, familyMembers[0].email)}

        >
          <Text style={styles.gridText}>Health Records</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20 }}>
        {/* Tasks for Today */}
        <Text style={styles.heading}>Tasks for Today</Text> {/* Change "Goals for Today" to "Tasks for Today" */}

        {tasksForToday.map((task, index) => (
          <View key={index} style={styles.taskContainer}>
            <Text style={styles.taskText}>{task}</Text>
          </View>
        ))}
      </View>

      <View style={{ padding: 20 }}>
        {/* Family Members List */}
        <FlatList
          data={familyMembers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.familyMemberRow}>
              <Text style={styles.familyMemberText}>{item.email}</Text>
              <TouchableOpacity
                style={styles.reminderButton}
                onPress={() => {
                  setSelectedMember(item);
                  setShowReminder(true);
                }}
              >
                <Text>Remind</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <NotifyParentModal
        userRole={'Parent'}
        visible={showReminder}
        selectedMember={selectedMember}
        onClose={() => {
          setSelectedMember(null);
          setShowReminder(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,  // Adjust opacity as needed
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 50,
    padding: 10,
  },
  gridItem: {
    backgroundColor: '#42a5f5',
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  gridText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
  },
  taskContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 5,
  },
  taskText: {
    fontSize: 16,
    color: 'black',
  },
  familyMemberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 5,
  },
  familyMemberText: {
    fontSize: 16,
    color: 'black',
  },
  reminderButton: {
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
});

export default ProtectorHome;



