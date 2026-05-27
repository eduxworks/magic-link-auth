import AuthStatus from "@/components/AuthStatus";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Autenticación Magic Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de autenticación sin contraseña
          </p>
        </div>

        <AuthStatus />
      </div>
    </main>
  );
}
