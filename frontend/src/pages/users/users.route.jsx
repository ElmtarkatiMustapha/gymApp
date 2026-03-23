import { Route, Routes } from "react-router-dom";
import { Users } from ".";
import { SingleUser } from "./singlePage";
export function UsersRoute() {
    return (
        <Routes>
            <Route index element={<Users />} />
            <Route path="/:id" element={<SingleUser />} />
        </Routes>
    )
}
