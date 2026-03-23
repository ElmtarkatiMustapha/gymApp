import { Link } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import { FaHome } from "react-icons/fa";   
import { Lang } from "../../assets/js/lang";
import { FaUsers } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { MdOutlineSecurity } from "react-icons/md";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaUsersGear } from "react-icons/fa6";
import { IoIosPricetags } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import { SidebarBtn } from "../SidebarBtn";
import { useAppState } from "../../context/context";

export function MobileSidebar(){
    const stateApp = useAppState();
    return (
        <div className="sidebar offcanvas offcanvas-start" data-bs-backdrop="static" tabIndex="-1" id="mobileNavbar" aria-labelledby="offcanvasRightLabel">
            <div className="offcanvas-header">
                <div className="">
                    <Link to="/" className="brand">
                        <img src={Logo} alt="" className="logo" fetchPriority="high" />
                    </Link>
                </div>
                <button id="closeProfileMenu" type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <nav className=" d-flex flex-column flex-shrink-0 position-fixed">

                    <div className="nav flex-column">
                        {stateApp.userRole =="admin" && <SidebarBtn label="Dashboard" Icon={FaHome} path="/" />}
                        <SidebarBtn label="Customers" Icon={FaUsers} path="/customers" />
                        <SidebarBtn label="Subscriptions" Icon={FaListCheck} path="/subscriptions" />
                        <SidebarBtn label="Insurances" Icon={MdOutlineSecurity} path="/insurances" />
                        {stateApp.userRole =="admin" && 
                            <>
                                <SidebarBtn label="Statistics" Icon={LuChartNoAxesCombined} path="/statistics" />
                                <SidebarBtn label="Users" Icon={FaUsersGear} path="/users" />
                                <SidebarBtn label="Plans" Icon={IoIosPricetags} path="/plans" />
                                <SidebarBtn label="Settings" Icon={IoMdSettings} path="/settings" />
                            </>
                        }
                        </div>
                </nav>
            </div>
        </div>
    )
}