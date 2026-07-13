import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login,register,logout } from "../services/auth.api";

const useAuth = () => {
    const context = useContext(AuthContext);
    const { user,setuser,loading,setloading } = context;

    /* Login */

    const handleLogin = async ({email,password}) => {
        setloading(true);

        try {
            const data = await login({email,password})
            setuser(data.user)
        } catch (err) {
            console.log(err)
        }finally {
            setloading(false)
        }
    }

    /* Register */

    const handleRegister = async ({username,email,password}) => {
        setloading(true);
        try {
            const data = await register({username,email,password})
            setuser(data.user)
        } catch(err) {
            console.log(err)
        } finally {
            setloading(false)
        }
    }

    /* Logout */

    const handleLogout = async () => {
        setloading(true);
        try {
            const data = await logout()
            setuser(null)
        } catch(err) {
            console.log(err)
        }finally {
            setloading(false)
        }
    }


    return { user,loading,setuser,setloading,handleLogin,handleRegister,handleLogout }
}

export default useAuth