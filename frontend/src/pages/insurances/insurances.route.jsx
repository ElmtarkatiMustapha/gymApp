import { Route, Routes } from "react-router-dom";
import { Insurances } from ".";
import { Lang } from "../../assets/js/lang";

export function InsurancesRoute() {
    return (
        <Routes>
            <Route index element={<Insurances />} />
            <Route path="/:id" element={<h1><Lang>Insurance Details</Lang></h1>} />
        </Routes>
    )
}
