import { Modal, Pressable, Text, View, StyleSheet, Alert } from 'react-native';
import { BlurView } from 'expo-blur';

export default function SettingsDrawer({ visible, onClose, onSignOut }) {
  const menuItems = [
    { icon: '⚙️', label: 'Settings', action: 'settings' },
    { icon: '🔒', label: 'Permissions', action: 'permissions' },
    { icon: 'ℹ️', label: 'About PayTaka', action: 'about' },
    { icon: '💬', label: 'Contact Support', action: 'support' },
    { icon: '🚪', label: 'Sign Out', action: 'signout' },
  ];

  const handleMenuPress = (action) => {
    if (action === 'signout') {
      onClose();
      setTimeout(() => {
        onSignOut?.();
      }, 300);
    } else {
      Alert.alert('Coming Soon', `${action.charAt(0).toUpperCase() + action.slice(1)} feature is coming soon!`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} style={styles.blurOverlay} />
      </Pressable>

      <View style={styles.drawerContainer}>
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.action}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleMenuPress(item.action)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[
                  styles.menuLabel,
                  item.action === 'signout' && styles.menuLabelDanger,
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurOverlay: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '75%',
    maxWidth: 300,
  },
  drawer: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 60,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuList: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemLast: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 28,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  menuLabelDanger: {
    color: '#FF6B6B',
  },
});

// Made with Bob
