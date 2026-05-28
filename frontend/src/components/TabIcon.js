import { Image } from 'react-native';

const iconSources = {
  Wallet: require('../../assets/WalletIcon.png'),
  Remit: require('../../assets/RemitIcon.png'),
  Scanner: require('../../assets/QRIcon.png'),
  History: require('../../assets/HistoryIcon.png'),
};

export default function TabIcon({ tab, active, size = 22 }) {
  return (
    <Image
      source={iconSources[tab]}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        opacity: active ? 1 : 0.78,
        transform: active ? [{ scale: 1.06 }] : undefined,
      }}
    />
  );
}