import { getImageURL } from "../api/api";
import { MdOutlineMenuOpen } from "react-icons/md";
import "../assets/css/navbar.css";
import Logo from "../assets/logo.svg";
import { Picture } from "./Picture";
import { RightMenu } from "./RightMenu";
import { useAppState } from "../context/context";
export function Navbar() {
    const appState = useAppState();
    return (
        <>
            <div className="customNavbar container-fluid ps-4 p-2">
                <div className="row m-0">
                    <div className="col-6 align-items-center d-flex">
                        <img src={Logo} alt="" className="logo" fetchPriority="high" />
                    </div>
                    <div className="col-6 text-end align-items-center d-flex justify-content-end">
                        <button className="border-0 m-0 p-0 bg-transparent " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                            <Picture picture={appState.currentUser.picture || "defaultProfile.jpg"} />
                        </button>
                    </div>
                </div>
            </div>
            <RightMenu />
        </>
    )
}