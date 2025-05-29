import OpenVPN, { VPNState } from 'react-native-simple-openvpn';

type ConnectOptions = {
  config: string; // содержимое .ovpn конфигурации
  username?: string;
  password?: string;
};

class VPNService {
  private static instance: VPNService;
  private listeners: ((state: VPNState) => void)[] = [];

  private constructor() {
    OpenVPN.onStateChanged((state) => {
      console.log('[VPN State]', state);
      this.listeners.forEach((listener) => listener(state));
    });
  }

  static getInstance() {
    if (!VPNService.instance) {
      VPNService.instance = new VPNService();
    }
    return VPNService.instance;
  }

  async connect({ config, username, password }: ConnectOptions) {
    try {
      await OpenVPN.connect({ config, username, password });
    } catch (error) {
      console.error('[VPN Connect Error]', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await OpenVPN.disconnect();
    } catch (error) {
      console.error('[VPN Disconnect Error]', error);
    }
  }

  onStateChanged(listener: (state: VPNState) => void) {
    this.listeners.push(listener);
  }

  removeAllListeners() {
    this.listeners = [];
  }
}

export default VPNService.getInstance();
