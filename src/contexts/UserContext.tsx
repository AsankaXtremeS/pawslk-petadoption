import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase, createSecureClient } from '@/utils/supabase';

export interface UserData {
  id: string;
  name: string;
  mobile: string;
  countryCode: string;
  language: 'en' | 'si' | 'ta';
  /** Server-generated secret token for ownership verification. Never share publicly. */
  userToken: string;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isRegistered: boolean;
  clearUser: () => void;
  registerUser: (data: Omit<UserData, 'id' | 'userToken'> & { password: string }) => Promise<UserData>;
  loginByMobile: (mobile: string, password: string) => Promise<UserData>;
  updateUser: (updates: Partial<Pick<UserData, 'name' | 'mobile' | 'countryCode' | 'language'>>) => Promise<UserData>;
  deleteAccount: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'PawConnect_user';

function getStoredUser(): UserData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(getStoredUser);

  const setUser = useCallback((userData: UserData | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Register a new user or return existing user if mobile already exists.
   * Uses the secure_register database function to prevent user_token leakage.
   */
  const registerUser = useCallback(async (data: Omit<UserData, 'id' | 'userToken'> & { password: string }): Promise<UserData> => {
    const cleanMobile = data.mobile.replace(/\s/g, '');

    const { data: result, error } = await supabase
      .rpc('secure_register', {
        p_name: data.name,
        p_mobile: cleanMobile,
        p_password: data.password,
        p_country_code: data.countryCode,
        p_language: data.language,
      });

    if (error) throw new Error(error.message || 'Registration failed');
    if (!result || result.length === 0) throw new Error('Registration failed — no data returned');

    const row = result[0];
    const userData: UserData = {
      id: row.id,
      name: row.name,
      mobile: row.mobile,
      countryCode: row.country_code,
      language: row.language,
      userToken: row.user_token,
    };
    setUser(userData);
    return userData;
  }, [setUser]);

  /**
   * Login by mobile number using the secure_login database function.
   * The function runs as SECURITY DEFINER so it can read the hidden user_token column.
   */
  const loginByMobile = useCallback(async (mobile: string, password: string): Promise<UserData> => {
    const cleanMobile = mobile.replace(/\s/g, '');

    const { data: result, error } = await supabase
      .rpc('secure_login', { p_mobile: cleanMobile, p_password: password });

    if (error) throw new Error(error.message || 'Failed to look up user');
    if (!result || result.length === 0) throw new Error('No account found with this number');

    const row = result[0];
    const userData: UserData = {
      id: row.id,
      name: row.name,
      mobile: row.mobile,
      countryCode: row.country_code,
      language: row.language,
      userToken: row.user_token,
    };
    setUser(userData);
    return userData;
  }, [setUser]);

  /**
   * Update user profile (name, mobile, language, countryCode).
   * Uses secure client with x-user-token header for RLS verification.
   */
  const updateUser = useCallback(async (
    updates: Partial<Pick<UserData, 'name' | 'mobile' | 'countryCode' | 'language'>>
  ): Promise<UserData> => {
    if (!user) throw new Error('Not logged in');

    const secureClient = createSecureClient(user.userToken);

    // Build DB-compatible update object
    const dbUpdates: Record<string, string> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile.replace(/\s/g, '');
    if (updates.countryCode !== undefined) dbUpdates.country_code = updates.countryCode;
    if (updates.language !== undefined) dbUpdates.language = updates.language;

    const { error } = await secureClient
      .from('users')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) throw new Error(error.message || 'Failed to update profile');

    // Update local state
    const updatedUser: UserData = {
      ...user,
      ...updates,
      mobile: updates.mobile ? updates.mobile.replace(/\s/g, '') : user.mobile,
    };
    setUser(updatedUser);
    return updatedUser;
  }, [user, setUser]);

  /**
   * Delete the user's account and all their animal listings (cascade).
   * Uses secure client with x-user-token for RLS verification.
   */
  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('Not logged in');

    const secureClient = createSecureClient(user.userToken);

    const { error } = await secureClient
      .from('users')
      .delete()
      .eq('id', user.id);

    if (error) throw new Error(error.message || 'Failed to delete account');

    // Clear local state
    clearUser();
  }, [user, clearUser]);

  /**
   * Update the user's password securely.
   */
  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) throw new Error('Not logged in');

    const secureClient = createSecureClient(user.userToken);

    const { error } = await secureClient
      .rpc('update_password', {
        p_user_id: user.id,
        p_current_password: currentPassword,
        p_new_password: newPassword,
      });

    if (error) throw new Error(error.message || 'Failed to update password');
  }, [user]);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isRegistered: !!user,
      clearUser,
      registerUser,
      loginByMobile,
      updateUser,
      deleteAccount,
      updatePassword,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
