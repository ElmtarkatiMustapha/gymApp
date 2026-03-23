import api, { getImageURL } from "../api/api";
import { useAppAction, useAppState } from "../context/context";
import { ButtonDanger } from "./ButtonDanger";
import { LangSelect } from "./LangSelect";
export function RightMenu() {
    /**
     * @desc handle logout 
     * @todo send request to server-side
     * @todo run handleClick function
     * @todo navigate to login page
     */
    const appAction = useAppAction();
    const appState = useAppState();
    const handleClose = (e) => {
        let closeBtn = document.getElementById("closeProfileMenu")
        closeBtn.click()
    }
    const handlelogout = (e) => {
        e.preventDefault()
        handleClose()
        api({
            method: "get",
            url: "/logout"
        }).then(res => {
            location.reload()
        }).catch(err => {
            //handle error
            appAction({ type: "SET_ERROR", payload: err?.response?.data?.message });

        })
    }
    return (
        <div className="offcanvas offcanvas-end rightMenu" data-bs-backdrop="static" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
            <div className="offcanvas-header">
                {/* <h3 className="offcanvas-title h3 " id="offcanvasRightLabel"> <Lang>Hello!!</Lang> </h3> */}
                <button id="closeProfileMenu" type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="picture d-flex justify-content-center pb-2">
                                <div
                                    style={{
                                        backgroundImage: "url(" + getImageURL(appState.currentUser.picture || "defaultProfile.jpg") + ")",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        height: "13rem",
                                        width: "13rem"
                                    }}
                                    className="bg-image rounded-circle position-relative">
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="p-1">
                                <div style={{
                                    borderRadius: "8px",
                                }} className=" p-0 text-center">
                                    <div className="title h5 fst-italic text-body-secondary text-decoration-underline fw-semibold">{appState.currentUser.name}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 text-center">
                            <div className="p-1">
                                <div className="title h6 fst-italic  d-inline fw-semibold">{appState.currentUser.role.title}</div>
                            </div>
                        </div>
                        <div className="col-12 text-center">
                            <div className="p-1 d-inline-block">
                                <LangSelect />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="offcanva-footer pb-3 pt-3 border-top">
                <div className="col-12">
                    <div className="p-1 text-center">
                        <ButtonDanger type="button" handleClick={handlelogout} label="Logout" />
                    </div>
                </div>
            </div>
        </div>
    )
}