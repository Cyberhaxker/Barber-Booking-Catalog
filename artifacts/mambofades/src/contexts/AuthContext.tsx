import { createContext, useContext, useState, useEffect } from "react";
import { useGetAuthMe, useAdminLogin, useAdminLogout, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  isAdmin: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  const { data, isLoading } = useGetAuthMe({
    query: { queryKey: getGetAuthMeQueryKey(), retry: false },
  });

  useEffect(() => {
    if (data !== undefined) {
      setIsAdmin(data.authenticated);
    }
  }, [data]);

  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();

  async function login(password: string): Promise<boolean> {
    try {
      const result = await loginMutation.mutateAsync({ data: { password } });
      setIsAdmin(result.authenticated);
      await queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
      return result.authenticated;
    } catch {
      return false;
    }
  }

  async function logout(): Promise<void> {
    await logoutMutation.mutateAsync();
    setIsAdmin(false);
    await queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
  }

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
