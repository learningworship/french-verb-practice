import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  getAllUsers,
  getUserStats,
  banUser,
  unbanUser,
  getDefaultVerbs,
  addDefaultVerb,
  deleteDefaultVerb,
} from '../utils/adminService';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'verbs'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [verbs, setVerbs] = useState([]);
  
  // Modal states
  const [showAddVerbModal, setShowAddVerbModal] = useState(false);
  const [newVerb, setNewVerb] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [addingVerb, setAddingVerb] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const result = await getUserStats();
        if (result.success) setStats(result.stats);
      } else if (activeTab === 'users') {
        const result = await getAllUsers();
        if (result.success) setUsers(result.users);
      } else if (activeTab === 'verbs') {
        const result = await getDefaultVerbs();
        if (result.success) setVerbs(result.verbs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle ban/unban user
  const handleToggleBan = async (user) => {
    const action = user.is_banned ? 'unban' : 'ban';
    const message = user.is_banned 
      ? `Unban ${user.email}?`
      : `Ban ${user.email}? They won't be able to use the app.`;

    const performAction = async () => {
      const result = user.is_banned 
        ? await unbanUser(user.id)
        : await banUser(user.id, 'Banned by admin');
      
      if (result.success) {
        Alert.alert('Success', `User ${action}ned successfully`);
        loadData();
      } else {
        Alert.alert('Error', result.error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        performAction();
      }
    } else {
      Alert.alert(
        `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: action.charAt(0).toUpperCase() + action.slice(1), onPress: performAction }
        ]
      );
    }
  };

  // Handle add verb
  const handleAddVerb = async () => {
    if (!newVerb.trim() || !newTranslation.trim()) {
      Alert.alert('Error', 'Please enter both verb and translation');
      return;
    }

    setAddingVerb(true);
    const result = await addDefaultVerb(newVerb, newTranslation);
    setAddingVerb(false);

    if (result.success) {
      Alert.alert('Success', 'Verb added successfully');
      setNewVerb('');
      setNewTranslation('');
      setShowAddVerbModal(false);
      loadData();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  // Handle delete verb
  const handleDeleteVerb = async (verb) => {
    const performDelete = async () => {
      const result = await deleteDefaultVerb(verb.id);
      if (result.success) {
        Alert.alert('Success', 'Verb deleted successfully');
        loadData();
      } else {
        Alert.alert('Error', result.error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${verb.verb}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Verb',
        `Delete "${verb.verb}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  // Render Stats Tab
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>📊 Dashboard</Text>
      
      {stats ? (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.regularUsers}</Text>
            <Text style={styles.statLabel}>Regular Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.adminUsers}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={[styles.statCard, stats.bannedUsers > 0 && styles.statCardWarning]}>
            <Text style={styles.statNumber}>{stats.bannedUsers}</Text>
            <Text style={styles.statLabel}>Banned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalVerbs}</Text>
            <Text style={styles.statLabel}>Default Verbs</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>No stats available</Text>
      )}
    </View>
  );

  // Render Users Tab
  const renderUsers = () => (
    <View style={styles.usersContainer}>
      <Text style={styles.sectionTitle}>👥 Users ({users.length})</Text>
      
      {users.length === 0 ? (
        <Text style={styles.emptyText}>No users found</Text>
      ) : (
        users.map((user) => (
          <View key={user.id} style={[styles.userCard, user.is_banned && styles.userCardBanned]}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userBadges}>
                {user.role === 'admin' && (
                  <View style={styles.badgeAdmin}>
                    <Text style={styles.badgeText}>ADMIN</Text>
                  </View>
                )}
                {user.is_banned && (
                  <View style={styles.badgeBanned}>
                    <Text style={styles.badgeText}>BANNED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userDate}>
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            {user.role !== 'admin' && (
              <TouchableOpacity
                style={[styles.actionButton, user.is_banned ? styles.unbanButton : styles.banButton]}
                onPress={() => handleToggleBan(user)}
              >
                <Text style={styles.actionButtonText}>
                  {user.is_banned ? 'Unban' : 'Ban'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>
  );

  // Render Verbs Tab
  const renderVerbs = () => (
    <View style={styles.verbsContainer}>
      <View style={styles.verbsHeader}>
        <Text style={styles.sectionTitle}>📚 Default Verbs ({verbs.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddVerbModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Verb</Text>
        </TouchableOpacity>
      </View>
      
      {verbs.length === 0 ? (
        <Text style={styles.emptyText}>No verbs found</Text>
      ) : (
        verbs.map((verb) => (
          <View key={verb.id} style={styles.verbCard}>
            <View style={styles.verbInfo}>
              <Text style={styles.verbText}>{verb.verb}</Text>
              <Text style={styles.verbTranslation}>{verb.translation}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteVerb(verb)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            📊 Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            👥 Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'verbs' && styles.activeTab]}
          onPress={() => setActiveTab('verbs')}
        >
          <Text style={[styles.tabText, activeTab === 'verbs' && styles.activeTabText]}>
            📚 Verbs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9C27B0" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'verbs' && renderVerbs()}
          </>
        )}
      </ScrollView>

      {/* Add Verb Modal */}
      <Modal
        visible={showAddVerbModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVerbModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Verb</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newVerb}
              onChangeText={setNewVerb}
              placeholder="French verb (e.g., manger)"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              value={newTranslation}
              onChangeText={setNewTranslation}
              placeholder="English translation (e.g., to eat)"
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddVerbModal(false);
                  setNewVerb('');
                  setNewTranslation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddVerb}
                disabled={addingVerb}
              >
                {addingVerb ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Verb</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#9C27B0',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#9C27B0',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  
  // Stats styles
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardWarning: {
    backgroundColor: '#ffebee',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  
  // Users styles
  usersContainer: {
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userCardBanned: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userBadges: {
    flexDirection: 'row',
    marginTop: 5,
  },
  badgeAdmin: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
  },
  badgeBanned: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  banButton: {
    backgroundColor: '#f44336',
  },
  unbanButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Verbs styles
  verbsContainer: {
    marginBottom: 20,
  },
  verbsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  verbCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verbInfo: {
    flex: 1,
  },
  verbText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  verbTranslation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

