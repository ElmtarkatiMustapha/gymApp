import { Route, Routes } from "react-router-dom";
import { Customers } from ".";
import { SingleCustomer } from "./singlePage";

export function CustomersRoute() {
    return (
        <Routes>
            <Route index element={<Customers />} />
            <Route path="/:id" element={<SingleCustomer />} />
        </Routes>
    )
}