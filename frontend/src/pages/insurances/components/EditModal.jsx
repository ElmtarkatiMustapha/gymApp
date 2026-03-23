import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { Spinner } from "../../../components/Spinner";
import { ButtonBlue } from "../../../components/ButtonBlue";
import api from "../../../api/api";
import { useEffect, useState } from "react";

export function EditModal({ handleClose, onInsuranceEdited, editedInsuranceId }) {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        start_at: ""
    });

    const appState = useAppState();
    const appAction = useAppAction();

    useEffect(() => {
        if (editedInsuranceId) {
            api.get(`/insurances/${editedInsuranceId}`)
                .then(res => {
                    const data = res.data.data;
                    const parts = data.start_at.split('/');
                    const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : data.start_at;

                    setFormData({
                        start_at: formattedDate
                    });
                    setLoading(false);
                })
                .catch(err => {
                    appAction({ type: "SET_ERROR", payload: "Failed to fetch insurance data" });
                    handleClose();
                });
        }
    }, [editedInsuranceId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        api.post(`/insurances/update/${editedInsuranceId}`, formData)
            .then(() => {
                appAction({ type: "SET_SUCCESS", payload: "Insurance updated successfully" });
                onInsuranceEdited();
                handleClose();
            })
            .catch(err => {
                appAction({ type: "SET_ERROR", payload: err?.response?.data?.message || "Failed to update insurance" });
                setLoading(false);
            });
    };

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0">
                                <Lang>Edit Insurance</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {loading ? <div className="text-center p-3"><Spinner /></div> : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Start Date</Lang> (*) :</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        required
                                        value={formData.start_at}
                                        onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer d-flex justify-content-end">
                        <ButtonBlue label={"Save"} disabled={loading} type={"submit"} />
                    </div>
                </form>
            </div>
        </div>
    );
}
