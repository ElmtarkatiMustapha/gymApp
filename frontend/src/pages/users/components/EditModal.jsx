import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { Spinner } from "../../../components/Spinner";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { UploadImage } from "../../../components/UploadImage";
import api from "../../../api/api";
import { useEffect, useState, useRef } from "react";

export function EditModal({ handleClose, onUserEdited, editedUser }) {
    const [loading, setLoading] = useState(true);
    const refPassword = useRef(null);
    const refConfPassword = useRef(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        cin: "",
        phone: "",
        username: "",
        password: "",
        sexe: "",
        active: null,
        role: "",
        picture: ""
    });
    const appState = useAppState();
    const appAction = useAppAction();

    const isEditingSelf = appState.currentUser && appState.currentUser.id === editedUser;

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData(e.target);
        // If editing self, role and active might be disabled, so we ensure they are sent if needed
        // or the backend handles it.Our backend handles it by ignoring them if it's the same user.
        if (refPassword.current.value !== refConfPassword.current.value) {
            appAction({
                type: "SET_ERROR",
                payload: "Passwords do not match"
            })
            setLoading(false)
            return;
        }

        api({
            method: "post", // Using post with _method=PUT for FormData compatibility with files in Laravel
            url: "/users/update/" + editedUser,
            data: data,
            withCredentials: true
        }).then(res => {
            appAction({
                type: "SET_SUCCESS",
                payload: "User updated successfully"
            });
            if (isEditingSelf) {
                appAction({
                    type: "SET_USER",
                    payload: res.data.data
                })
            }
            onUserEdited();
            handleClose();
            setLoading(false);
        }).catch(() => {
            appAction({
                type: "SET_ERROR",
                payload: "Failed to update user"
            })
            setLoading(false)
        })
    }

    useEffect(() => {
        api({
            method: "get",
            url: "/users/" + editedUser,
            withCredentials: true
        }).then(res => {
            setFormData({
                ...res.data.data,
                password: "" // Clear password field for security
            });
            setLoading(false);
        }).catch(err => {
            appAction({
                type: "SET_ERROR",
                payload: err?.response?.data?.message
            })
            setLoading(false)
        })
    }, [editedUser]);

    // Helper to get translation without hook violation
    const t = (key) => appState.langData[key] || key;

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0" style={{ color: "var(--primary-color)" }}>
                                <Lang>Edit User</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Name</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="text" name="name" required defaultValue={formData.name} disabled={loading} className="form-control" placeholder={t("Ex: mustapha el mtarkati")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Email</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="email" required defaultValue={formData.email} disabled={loading} name="email" className="form-control" placeholder={t("Tap email")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Cin</Lang> : {loading && <Spinner />}</label>
                            <input type="text" defaultValue={formData.cin} disabled={loading} name="cin" className="form-control" placeholder={t("Tap cin")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Phone</Lang> : {loading && <Spinner />}</label>
                            <input type="text" defaultValue={formData.phone} disabled={loading} name="phone" className="form-control" placeholder={t("Tap Phone")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Username</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="text" required defaultValue={formData.username} disabled={loading} name="username" className="form-control" placeholder={t("Tap username")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Password</Lang> : {loading && <Spinner />}</label>
                            <input type="password" ref={refPassword} defaultValue={formData.password} disabled={loading} name="password" className="form-control" placeholder={t("Tap password")} />
                            <small className="text-muted text-sm"><Lang>Leave empty to keep current password</Lang></small>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Re-tap Password</Lang> : {loading && <Spinner />}</label>
                            <input type="password" ref={refConfPassword} defaultValue={formData.password} disabled={loading} name="confPassword" className="form-control" placeholder={t("Confirm password")} />
                            <small className="text-muted text-sm"><Lang>Leave empty to keep current password</Lang></small>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Sexe</Lang> (*) : {loading && <Spinner />}</label>
                            <div>
                                {formData.id &&
                                    <>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.sexe === "male"} name="sexe" value="male" className="form-check-input" id="male" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="male"><Lang>Male</Lang></label>
                                        </span>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.sexe === "female"} name="sexe" value="female" className="form-check-input" id="female" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="female"><Lang>Female</Lang></label>
                                        </span>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Role</Lang> (*) : {loading && <Spinner />}</label>
                            {formData.id && (
                                appState.currentUser.id == formData.id ?
                                    <div>
                                        <span className="p-1">
                                            <input type="radio" checked={formData.role == 1 || formData.role_id == 1} name="role" value="1" className="form-check-input" id="admin" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="admin"><Lang>Admin</Lang></label>
                                        </span>
                                        <span className="p-1">
                                            <input type="radio" checked={formData.role == 2 || formData.role_id == 2} name="role" value="2" className="form-check-input" id="manager" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="manager"><Lang>Manager</Lang></label>
                                        </span>
                                    </div>
                                    :
                                    <div>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.role == 1 || formData.role_id == 1} name="role" value="1" className="form-check-input" id="admin" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="admin"><Lang>Admin</Lang></label>
                                        </span>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.role == 2 || formData.role_id == 2} name="role" value="2" className="form-check-input" id="manager" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="manager"><Lang>Manager</Lang></label>
                                        </span>
                                    </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Status</Lang> (*) : {loading && <Spinner />}</label>
                            {formData.id && (
                                appState.currentUser.id == formData.id ?
                                    <div >
                                        <span className="p-1">
                                            <input type="radio" checked={formData.active == 1} name="active" value="1" className="form-check-input" id="active" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="active"><Lang>Active</Lang></label>
                                        </span>
                                        <span className="p-1">
                                            <input type="radio" checked={formData.active == 0} name="active" value="0" className="form-check-input" id="inactive" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="inactive"><Lang>Inactive</Lang></label>
                                        </span>
                                    </div>
                                    :
                                    <div >
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.active == 1} name="active" value="1" className="form-check-input" id="active" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="active"><Lang>Active</Lang></label>
                                        </span>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.active == 0} name="active" value="0" className="form-check-input" id="inactive" required disabled={loading || isEditingSelf} />
                                            <label className="form-check-label ps-1" htmlFor="inactive"><Lang>Inactive</Lang></label>
                                        </span>
                                    </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Picture</Lang> : {loading && <Spinner />}</label>
                            <UploadImage loading={loading} image={formData.picture} />
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
