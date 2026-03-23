import { useEffect } from "react";
import "../assets/css/sidebar.css";
import { useAppState } from "../context/context";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./mobile/MobileSidebar";
import { MobileNavbar } from "./mobile/MobileNavbar";

export function PagesContainer({ children }) {
    const state = useAppState();
    return (
        <div className="d-flex">
            {state.isMobile ? <MobileSidebar /> : <Sidebar />}
            <main className={state.isMobile ? "main-content w-100" : "main-content w-100 main-content-normale"}>
                {state.isMobile ? <MobileNavbar /> : <Navbar />}
                <div className="p-2" dir={state.currentLang === "ar.json" ? "rtl" : "ltr"}>
                    {children}
                </div>
            </main>

        </div>
    )
}