import { registerRootComponent } from 'expo';

// Use the new V2 app with React Native Game Engine
import App from './AppV2';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
