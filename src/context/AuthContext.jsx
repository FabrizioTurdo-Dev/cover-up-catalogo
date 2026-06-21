// src/context/AuthContext.jsx
// ====================================================================
// AUTENTICACIÓN PARA PANEL ADMIN
// ====================================================================
//
// CÓMO FUNCIONA:
// - Se usa Supabase Auth con Email/Password (gratuito hasta 50k usuarios)
// - Solo el usuario que creás acá puede loguearse inicialmente
//
// CÓMO AGREGAR OTROS ADMINS (sin que cualquiera se registre):
// ====================================================================
// OPCIÓN A) Desde el Dashboard de Supabase:
//   1. Andá a supabase.com → tu proyecto → Authentication → Users
//   2. Click "Add user"
//   3. Ingresá el email y password del nuevo admin
//   4. El nuevo admin ya puede loguearse en #/admin
//
// OPCIÓN B) Desde el código (invite links):
//   Si querés que otros admins se registren con tu aprobación,
//   podés agregar un sistema de "pending approvals" en la DB.
//   Por ahora, la forma más simple es la OPCIÓN A.
//
// OPCIÓN C) Registro abierto con código de invitación:
//   Si en el futuro querés un formulario de registro, necesitás:
//   1. Crear tabla "admin_invitations" en Supabase con códigos únicos
//   2. Modificar el formulario de registro para validar el código
//   3. Solo usuarios con código válido pueden registrarse
// ====================================================================

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error verificando sesión:", err.message);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn("useAuth usado fuera de AuthProvider");
  }
  return context || { user: null, login: async () => {}, logout: async () => {}, loading: false };
}
