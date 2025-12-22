// lib/authServiceOffline.ts
export type User = {
  id: string;             // unique user ID
  name: string;
  email: string;
  passwordHash: string;   // hashed password for production-like handling
  monthlyIncome: number;
  currency: string;
};

const USERS_KEY = 'offline_users';
const CURRENT_USER_KEY = 'offline_current_user';

export class AuthServiceOffline {
  // --- Helpers ---
  private static getUsersFromStorage(): Record<string, User> {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveUsersToStorage(users: Record<string, User>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private static setCurrentUserToken(userId: string) {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  }

  private static hashPassword(password: string): string {
    // Simple hash for offline production simulation (not for real production)
    return btoa(password); 
  }

  // --- Registration ---
  static register(user: Omit<User, 'id' | 'passwordHash'> & { password: string }): string | null {
    const users = this.getUsersFromStorage();
    const exists = Object.values(users).some(u => u.email === user.email);
    if (exists) return null; // email already registered

    const id = `${Date.now()}-${Math.random()}`;
    const passwordHash = this.hashPassword(user.password);

    const newUser: User = { ...user, id, passwordHash };
    users[id] = newUser;
    this.saveUsersToStorage(users);
    this.setCurrentUserToken(id); // auto-login after registration
    return id;
  }

  // --- Login ---
  static login(email: string, password: string): boolean {
    const users = this.getUsersFromStorage();
    const passwordHash = this.hashPassword(password);

    const token = Object.keys(users).find(t => 
      users[t].email === email && users[t].passwordHash === passwordHash
    );
    if (!token) return false;

    this.setCurrentUserToken(token);
    return true;
  }

  // --- Logout ---
  static logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // --- Current user ---
  static getCurrentUser(): User | null {
    const token = localStorage.getItem(CURRENT_USER_KEY);
    if (!token) return null;
    const users = this.getUsersFromStorage();
    return users[token] || null;
  }

  static getCurrentUserToken(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  // --- Update user ---
  static updateCurrentUser(updates: Partial<Omit<User, 'id' | 'passwordHash'>> & { password?: string }): User | null {
    const token = this.getCurrentUserToken();
    if (!token) return null;

    const users = this.getUsersFromStorage();
    const currentUser = users[token];
    if (!currentUser) return null;

    if (updates.password) {
      currentUser.passwordHash = this.hashPassword(updates.password);
      delete updates.password;
    }

    const updatedUser = { ...currentUser, ...updates };
    users[token] = updatedUser;
    this.saveUsersToStorage(users);
    return updatedUser;
  }
}
