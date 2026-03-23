import { Route, Routes } from "react-router-dom";
import { Plans } from ".";

export function PlansRoute() {
    return (
        <Routes>
            <Route index element={<Plans />} />
        </Routes>
    )
}
