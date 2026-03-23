import { Route, Routes } from "react-router-dom";
import { Statistics } from ".";

export function StatisticsRoute() {
    return (
        <Routes>
            <Route index element={<Statistics />} />
        </Routes>
    )
}
