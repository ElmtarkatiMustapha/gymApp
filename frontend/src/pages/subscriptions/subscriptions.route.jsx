import { Route, Routes } from "react-router-dom";
import { Subscriptions } from ".";
import { Lang } from "../../assets/js/lang";

export function SubscriptionsRoute() {
    return (
        <Routes>
            <Route index element={<Subscriptions />} />
            <Route path="/:id" element={<h1><Lang>Subscription Details</Lang></h1>} />
        </Routes>
    )
}
