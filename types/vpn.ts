export type VpnProtocol = 'openvpn' | 'l2tp';

export interface VpnProfile {
  id: string;
  name: string;
  protocol: VpnProtocol;
  username?: string;
  password?: string;
  
  // Специфично для OpenVPN
  configFile?: string; // Содержимое файла .ovpn в кодировке Base64
  
  // Специфично для L2TP/IPsec
  ipsecPreSharedKey?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  profileId: string | null;
  errorMessage?: string;
}