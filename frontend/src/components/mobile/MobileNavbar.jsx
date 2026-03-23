import {AiOutlineMenu } from "react-icons/ai"
import { getImageURL } from "../../api/api";
import Logo from "../../assets/logo.svg";
import { Picture } from "../Picture";
import { useAppState } from "../../context/context";
import { RightMenu } from "../RightMenu";

export function MobileNavbar(){
    const state = useAppState()
    return(
        <>
            <div className={state.isMobile ?"customNavbar container-fluid p-2" :"customNavbar container-fluid ps-4 p-2"}>
                <div className="row m-0">
                    <div className="col-3 p-0 align-items-center d-flex text-start">
                        <button className="btn-mobile-menu p-0" data-bs-toggle="offcanvas" data-bs-target="#mobileNavbar" aria-controls="mobileNavbar">
                            <AiOutlineMenu  /> 
                        </button>
                    </div>
                    <div className="col-6 align-items-center align-self-center text-center">
                        <img src={Logo} alt="" className="logo" fetchPriority="high" />
                    </div>
                    <div className="col-3 text-end align-items-center d-flex justify-content-end">
                        <button className="border-0 m-0 p-0 bg-transparent " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                            <Picture  picture={"defaultProfile.jpg" } />
                        </button>
                    </div>
                </div>
            </div>
            <RightMenu />
        </>
    )
}