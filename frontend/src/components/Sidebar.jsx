import { MdOutlineMenuOpen } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { FaHome } from "react-icons/fa";
import { Lang } from "../assets/js/lang";
import { FaUsers } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { MdOutlineSecurity } from "react-icons/md";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaUsersGear } from "react-icons/fa6";
import { IoIosPricetags } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { useEffect } from "react";
import { SidebarBtn } from "./SidebarBtn";
import { useAppState } from "../context/context";

export function Sidebar() {
    const stateApp = useAppState();
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
    }

    return (
        <nav className="sidebar d-flex flex-column flex-shrink-0 position-fixed">
            <button className="toggle-btn" onClick={toggleSidebar}>
                <MdOutlineMenuOpen />
            </button>

            <div className="p-3">
                <Link to="/" className="brand hide-on-collapse">
                    <img src={Logo} alt="" className="logo" fetchPriority="high" />
                </Link>
            </div>

            <div className="nav flex-column">
                {stateApp.userRole == "admin" && <SidebarBtn label="Dashboard" Icon={FaHome} path="/" />}
                <SidebarBtn label="Customers" Icon={FaUsers} path="/customers" />
                <SidebarBtn label="Subscriptions" Icon={FaListCheck} path="/subscriptions" />
                <SidebarBtn label="Insurances" Icon={MdOutlineSecurity} path="/insurances" />
                {stateApp.userRole == "admin" &&
                    <>
                        <SidebarBtn label="Statistics" Icon={LuChartNoAxesCombined} path="/statistics" />
                        <SidebarBtn label="Users" Icon={FaUsersGear} path="/users" />
                        <SidebarBtn label="Plans" Icon={IoIosPricetags} path="/plans" />
                        <SidebarBtn label="Settings" Icon={IoMdSettings} path="/settings" />
                    </>
                }
            </div>

            <div className="profile-section mt-auto p-4">
                <div className="">
                    <div className="ms-3 profile-info text-center">
                        <small className="text-muted"><Lang>© All right are reserved</Lang></small>
                    </div>
                </div>
            </div>
        </nav>
    )
}
