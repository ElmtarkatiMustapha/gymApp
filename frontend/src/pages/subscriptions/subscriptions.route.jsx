import { Route, Routes } from "react-router-dom";
import { Subscriptions } from ".";

export function SubscriptionsRoute() {
    return (
        <Routes>
            <Route index element={<Subscriptions />} />
            <Route path="/:id" element={<h1>Subscription Details</h1>} />
        </Routes>
    )
}
