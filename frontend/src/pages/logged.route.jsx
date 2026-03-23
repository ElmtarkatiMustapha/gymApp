import { PagesContainer } from "../components/PagesContainer";
import { PrivateAdminRoute } from "../components/PrivateRoute";
import { AdminRoute } from "./admin.route";
import { Routes, Route } from "react-router-dom";
import { CustomersRoute } from "./customers/customers.route";
import { SubscriptionsRoute } from "./subscriptions/subscriptions.route";
import { InsurancesRoute } from "./insurances/insurances.route";
import "../assets/css/pages.css"
export function LoggedRoute() {
    return (
        <PagesContainer>
            <Routes>
                {/* roles: manager or admin */}
                <Route path="/*" element={<PrivateAdminRoute component={<AdminRoute />} />} />
                {/*these routes for every user logged */}
                <Route path="/Customers/*" element={<CustomersRoute />} />
                <Route path="/subscriptions/*" element={<SubscriptionsRoute />} />
                <Route path="/insurances/*" element={<InsurancesRoute />} />
                <Route path="/profile" element={<h1>profile</h1>} />
            </Routes>
        </PagesContainer>
    )
}