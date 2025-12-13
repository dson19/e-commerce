import {useState, useEffect, createContext, useContext} from 'react';
import axios from 'axios';
import {toast} from 'sonner';

const AuthContext = createContext();
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // 
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/me', {withCredentials: true});
                setUser(res.data.user);
            }
            catch (error) {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);
    const signIn = async (user) => {
        setUser(user);
        toast.success("Đăng nhập thành công, chuyển đến trang chủ");
    }
    const signOut = async () => {
        try{
            await axios.post('http://localhost:5000/api/auth/signout', {}, {withCredentials: true});
            setUser(null);
            toast.success("Đăng xuất thành công");
        }
        catch (error) {
            toast.error("Đăng xuất thất bại");
        }
    };
    return (
        <AuthContext.Provider value={{user, loading, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);