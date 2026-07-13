import { Navigate } from "react-router-dom";
import Loading from "../../../components/Loading/Loading";
import useAuth from "../hooks/useAuth";

const Protected = ({children}) => {
    const {loading, user} = useAuth()

    if(loading) {
        return <Loading/>
    }

    if(!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected