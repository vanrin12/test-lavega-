export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface AuthSession {
  expiresAt: number;
  profile: UserProfile;
  hasRefreshToken?: boolean;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
}
