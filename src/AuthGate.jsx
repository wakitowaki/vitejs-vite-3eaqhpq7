import { useEffect, useState } from "react";
import { auth } from "./firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";

export default function AuthGate({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert("Errore login: " + error.message);
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-gray-700">
                <p>🔄 Controllo autenticazione...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-white p-6">
                <div className="bg-white p-8 rounded-xl shadow-md space-y-6 text-center">
                    <h2 className="text-2xl font-bold text-blue-800">🔐 Accesso richiesto</h2>
                    <button
                        onClick={handleLogin}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Accedi con Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen text-gray-800 font-sans px-4 py-8"
            style={{
                backgroundImage: 'url(/21.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Bottone Logout */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                    Esci ({user.displayName})
                </button>
            </div>

            {/* Contenuto autenticato */}
            {children}
        </div>
    );
}
