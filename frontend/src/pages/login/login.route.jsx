import { Route, Routes } from "react-router-dom";
import { LoginForm } from ".";
import { ResetPass } from "./resetpass";

export function LoginRoute(){
    return (
        <>
            <Routes>
                <Route index element={<LoginForm/>} />
                <Route path="resetpass/*" element={<ResetPass/>} />
            </Routes>
        </>
    )
}