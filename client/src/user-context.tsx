import { Call, StreamVideoClient, User as StreamUserType } from "@stream-io/video-react-sdk";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "universal-cookie";

interface User {
    username: string;
    name: string;
}

interface UserContextProps {
    user: User | null;
    setUser: (user: User | null) => void;
    client: StreamVideoClient | undefined;
    setClient: (client: StreamVideoClient | undefined) => void;
    call: Call | undefined;
    setCall: (call: Call | undefined) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [call, setCall] = useState<Call>();
    const [client, setClient] = useState<StreamVideoClient | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Moved this outside of useEffect

    const cookies = new Cookies();

    useEffect(() => {
        const token = cookies.get("token");
        const username = cookies.get("username");
        const name = cookies.get("name");

        if (!token || !username || !name) {
            setIsLoading(false);
            return;
        }

        const user: StreamUserType = {
            id: username,
            name,
        };

        const myClient = new StreamVideoClient({
            apiKey: "3nzxjr64zv64",
            user,
            token,
        });

        setClient(myClient);
        setUser({ username, name });
        setIsLoading(false);

        return () => {
            myClient.disconnectUser();
            setClient(undefined);
            setUser(null);
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, client, setClient, call, setCall }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
