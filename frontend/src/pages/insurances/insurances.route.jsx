import { Route, Routes } from "react-router-dom";
import { Insurances } from ".";

export function InsurancesRoute() {
    return (
        <Routes>
            <Route index element={<Insurances />} />
            <Route path="/:id" element={<h1>Insurance Details</h1>} />
        </Routes>
    )
}
