import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { Spinner } from "../../../components/Spinner";
import { ButtonBlue } from "../../../components/ButtonBlue";
import api from "../../../api/api";
import { useEffect, useState } from "react";

export function EditModal({ handleClose, onCustomerEdited, editedCustomerId }) {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        cin: "",
        phone: "",
        adresse: "",
        sexe: "",
        state: null
    });
    const appState = useAppState();
    const appAction = useAppAction();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData(e.target);

        api({
            method: "post",
            url: "/customers/update/" + editedCustomerId,
            data: data,
            withCredentials: true
        }).then(res => {
            appAction({
                type: "SET_SUCCESS",
                payload: "Customer updated successfully"
            });
            onCustomerEdited();
            handleClose();
            setLoading(false);
        }).catch(err => {
            appAction({
                type: "SET_ERROR",
                payload: "Failed to update customer"
            })
            setLoading(false)
        })
    }

    useEffect(() => {
        api({
            method: "get",
            url: "/customers/" + editedCustomerId,
            withCredentials: true
        }).then(res => {
            setFormData(res.data.data);
            setLoading(false);
        }).catch(err => {
            appAction({
                type: "SET_ERROR",
                payload: err?.response?.data?.message || "Failed to fetch customer data"
            })
            setLoading(false)
        })
    }, [editedCustomerId]);

    const t = (key) => appState.langData[key] || key;

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0" style={{ color: "var(--primary-color)" }}>
                                <Lang>Edit Customer</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Name</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="text" name="name" required defaultValue={formData.name} disabled={loading} className="form-control" placeholder="Ex: mustapha el mtarkati" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Email</Lang> (*) : {loading && <Spinner />}</label>
                            <input type="email" required defaultValue={formData.email} disabled={loading} name="email" className="form-control" placeholder={t("Tap email")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Cin</Lang> : {loading && <Spinner />}</label>
                            <input type="text" defaultValue={formData.cin} disabled={loading} name="cin" className="form-control" placeholder={t("Tap cin")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Phone</Lang> : {loading && <Spinner />}</label>
                            <input type="text" defaultValue={formData.phone} disabled={loading} name="phone" className="form-control" placeholder={t("Tap Phone")} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Adresse</Lang> : {loading && <Spinner />}</label>
                            <textarea defaultValue={formData.adresse} disabled={loading} name="adresse" className="form-control" placeholder={t("Tap adresse")}></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Sexe</Lang> (*) : {loading && <Spinner />}</label>
                            <div>
                                {formData.id &&
                                    <>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.sexe === "male"} name="sexe" value="male" className="form-check-input" id="male" required disabled={loading} />
                                            <label className="form-check-label ps-1" htmlFor="male"><Lang>Male</Lang></label>
                                        </span>
                                        <span className="p-1">
                                            <input type="radio" defaultChecked={formData.sexe === "female"} name="sexe" value="female" className="form-check-input" id="female" required disabled={loading} />
                                            <label className="form-check-label ps-1" htmlFor="female"><Lang>Female</Lang></label>
                                        </span>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Status</Lang> (*) : {loading && <Spinner />}</label>
                            {formData.id && (
                                <div >
                                    <span className="p-1">
                                        <input type="radio" defaultChecked={formData.state == 1} name="state" value="1" className="form-check-input" id="active" required disabled={loading} />
                                        <label className="form-check-label ps-1" htmlFor="active"><Lang>Active</Lang></label>
                                    </span>
                                    <span className="p-1">
                                        <input type="radio" defaultChecked={formData.state == 0} name="state" value="0" className="form-check-input" id="inactive" required disabled={loading} />
                                        <label className="form-check-label ps-1" htmlFor="inactive"><Lang>Inactive</Lang></label>
                                    </span>
                                </div>
                            )}
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
