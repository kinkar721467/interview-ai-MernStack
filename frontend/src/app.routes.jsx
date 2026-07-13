import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interviewreport from "./features/interview/pages/Interviewreport";
import AiPdfGenerator from "./features/interview/pages/AiPdfGenerator";
import Reports from "./features/interview/pages/Reports";
import Layout from "./components/layout/Layout";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: (
            <Protected>
                <Layout title="Home">
                    <Home />
                </Layout>
            </Protected>
        )
    },
    {
        path: "/report",
        element: (
            <Protected>
                <Layout title="Reports">
                    <Reports />
                </Layout>
            </Protected>
        )
    },
    {
        path: "/interview/:id",
        element: (
            <Protected>
                <Layout title="Interview Report">
                    <Interviewreport />
                </Layout>
            </Protected>
        )
    },
    {
        path: "/ai-pdf",
        element: (
            <Protected>
                <Layout title="AI PDF Generator">
                    <AiPdfGenerator />
                </Layout>
            </Protected>
        )
    }
]);

export default router;