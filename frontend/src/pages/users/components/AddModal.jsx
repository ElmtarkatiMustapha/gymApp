import { useState } from "react";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { Spinner } from "../../../components/Spinner";
import api from "../../../api/api";
import { UploadImage } from "../../../components/UploadImage";
import { useAppAction, useAppState } from "../../../context/context";
// import { toast } from "react-hot-toast";
export function AddModal({ handleClose, onUserAdded }) {
    const [loading, setLoading] = useState(false);
    const appAction = useAppAction()
    const appState = useAppState();
    const t = (key) => appState.langData[key] || key;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let formData = new FormData(e.target);

            const response = await api.post('/users', formData);
            if (response.data && response.data.data) {
                // if (window.toast) window.toast.success("User added successfully!");
                appAction({ type: "SET_SUCCESS", payload: "User added successfully" });
                if (onUserAdded) {
                    onUserAdded();
                }
                handleClose();
            }
        } catch {
            // console.error("Failed to add plan:", error.message);
            // if (window.toast) window.toast.error("Failed to add plan. Please check the fields.");
            // else alert("Failed to add plan");
            appAction({ type: "SET_ERROR", payload: "Failed to add user" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0" style={{ color: "var(--primary-color)" }}>
                                <Lang>Add User</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Name</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="text" name="name" required disabled={loading} className="form-control" placeholder={t("Ex: mustapha el mtarkati")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Email</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="email" required disabled={loading} name="email" className="form-control" placeholder={t("Tap email")} id="" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Cin</Lang> : {loading && <Spinner />}</label>
                            <input type="text" disabled={loading} name="cin" className="form-control" placeholder={t("Tap cin")} id="" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Phone</Lang> : {loading && <Spinner />}</label>
                            <input type="text" disabled={loading} name="phone" className="form-control" placeholder={t("Tap Phone")} id="" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Username</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="text" required disabled={loading} name="username" className="form-control" placeholder={t("Tap username")} id="" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Password</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="password" required disabled={loading} name="password" className="form-control" placeholder={t("Tap password")} id="" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Sexe</Lang> (*) : {loading && <Spinner />}</label>
                            <div>
                                <span className="p-1">
                                    <input type="radio" name="sexe" value="male" className="form-check-input" id="male" defaultChecked />
                                    <label className="form-check-label ps-1" htmlFor="male"><Lang>Male</Lang></label>
                                </span>
                                <span className="p-1">
                                    <input type="radio" name="sexe" value="female" className="form-check-input" id="female" />
                                    <label className="form-check-label ps-1" htmlFor="female"><Lang>Female</Lang></label>
                                </span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Role</Lang> (*) : {loading && <Spinner />}</label>
                            <div>
                                <span className="p-1">
                                    <input type="radio" name="role" value="1" className="form-check-input" id="admin" defaultChecked />
                                    <label className="form-check-label ps-1" htmlFor="admin"><Lang>Admin</Lang></label>
                                </span>
                                <span className="p-1">
                                    <input type="radio" name="role" value="2" className="form-check-input" id="manager" />
                                    <label className="form-check-label ps-1" htmlFor="manager"><Lang>Manager</Lang></label>
                                </span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Picture</Lang> : {loading && <Spinner />}</label>
                            <UploadImage loading={loading} image={""} />
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-end">
                        <ButtonBlue label={"Save"} disabled={loading} type={"submit"} />
                    </div>
                </form>
            </div>
        </div>
    )
}
