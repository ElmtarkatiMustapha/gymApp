import { Routes, Route } from "react-router-dom";
import { PlansRoute } from "./plans/plans.route";
import { UsersRoute } from "./users/users.route";
import { StatisticsRoute } from "./statistics/statistics.route";
import { SettingsRoute } from "./settings/settings.route";
import { Dashboard } from "./dashboard/index";

export function AdminRoute() {
    return (
        <>{/* ... */}
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path="/settings/*" element={<SettingsRoute />} />
                <Route path="/statistics/*" element={<StatisticsRoute />} />
                <Route path="/users/*" element={<UsersRoute />} />
                <Route path="/plans/*" element={<PlansRoute />} />
                <Route path="/*" element={<h1>Not Found 4O4</h1>} />
            </Routes>
        </>
    )
}