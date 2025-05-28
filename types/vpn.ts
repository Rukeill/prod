export type VpnProtocol = 'openvpn' | 'l2tp';

export interface VpnProfile {
  id: string;
  name: string;
  protocol: VpnProtocol;
  username?: string;
  password?: string;
  
  // OpenVPN specific
  configFile?: string; // Base64 encoded .ovpn file content
  
  // L2TP/IPsec specific
  ipsecPreSharedKey?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  profileId: string | null;
  errorMessage?: string;
}