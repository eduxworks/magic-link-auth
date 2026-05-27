"use client";

import { useAuth } from "@/lib/hooks";
import Link from "next/link";

export default function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No autenticado</p>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <div className="mb-4">
        <p className="text-green-600 dark:text-green-400 font-medium mb-2">
          ✓ Autenticado
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Correo: <span className="font-medium">{user.email}</span>
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
