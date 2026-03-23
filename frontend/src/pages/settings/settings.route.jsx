import { Route, Routes } from "react-router-dom";
import { Settings } from "./index";

export function SettingsRoute() {
    return (
        <Routes>
            <Route index element={<Settings />} />
        </Routes>
    )
}
