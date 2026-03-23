import { Link, useLocation } from "react-router-dom";
import { Lang } from "../assets/js/lang";

export function SidebarBtn({ label, Icon, path, handle = () => { } }) {
    const location = useLocation();
    const isActive = (location.pathname.includes(path) && path !== "/") || location.pathname === path;
    return (
        <Link to={path} className={isActive ? "sidebar-link active text-decoration-none ps-3 p-2" : "sidebar-link text-decoration-none ps-3 p-2"} onClick={handle}>
            <Icon className="me-3 icon" />
            <span className="hide-on-collapse"><Lang>{label}</Lang></span>
        </Link>
    )
}
