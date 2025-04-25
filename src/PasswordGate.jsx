import { useState, useEffect } from "react";

export default function PasswordGate({ children }) {
    const [inputPassword, setInputPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const correctPassword = "PeneGrosso22"; // 🔥 Qui c'è la tua password

    useEffect(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        if (storedAuth === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (inputPassword === correctPassword) {
            setIsAuthenticated(true);
            localStorage.setItem("isAuthenticated", "true");
        } else {
            alert("Password errata!");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        setIsAuthenticated(false);
        setInputPassword("");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-white p-6">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md space-y-4">
                    <h2 className="text-2xl font-bold text-center text-blue-800">🔒 Accesso Protetto</h2>
                    <input
                        type="password"
                        placeholder="Inserisci password..."
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="border w-full p-2 rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Entra
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Bottone Logout */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                >
                    Esci
                </button>
            </div>

            {/* Contenuto dell'app */}
            {children}
        </div>
    );
}
