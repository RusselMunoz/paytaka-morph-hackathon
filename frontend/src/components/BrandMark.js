import { Image } from 'react-native';
import { landingStyles } from '../styles/landingStyles';

export default function BrandMark({ size }) {
  return (
    <Image
      source={require('../../assets/Logo.png')}
      resizeMode="contain"
      style={[landingStyles.brandLogoImage, { width: size, height: size }]}
    />
  );
}