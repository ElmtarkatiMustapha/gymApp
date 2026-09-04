import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { Spinner } from "../../../components/Spinner";
import { ButtonBlue } from "../../../components/ButtonBlue";
import api from "../../../api/api";
import { useEffect, useState } from "react";

export function EditModal({ handleClose, onSubscriptionEdited, editedSubscriptionId }) {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        start_at: "",
        plan_id: ""
    });

    const appState = useAppState();
    const appAction = useAppAction();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes, subRes] = await Promise.all([
                    api.get("/plans"),
                    api.get(`/subscriptions/${editedSubscriptionId}`)
                ]);

                setPlans(plansRes.data.data);

                const data = subRes.data.data;
                const formatDateForInput = (d) => {
                    const parts = d.split('/');
                    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    return d;
                };

                setFormData({
                    start_at: formatDateForInput(data.start_at),
                    plan_id: data.plan?.id || ""
                });
                setLoading(false);
            } catch {
                appAction({ type: "SET_ERROR", payload: "Failed to fetch data" });
                handleClose();
            }
        };
        if (editedSubscriptionId) fetchData();
    }, [editedSubscriptionId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        api.post(`/subscriptions/update/${editedSubscriptionId}`, formData)
            .then(() => {
                appAction({ type: "SET_SUCCESS", payload: "Subscription updated successfully" });
                onSubscriptionEdited();
                handleClose();
            })
            .catch(err => {
                appAction({ type: "SET_ERROR", payload: err?.response?.data?.message || "Failed to update subscription" });
                setLoading(false);
            });
    };

    const t = (key) => appState.langData[key] || key;

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0">
                                <Lang>Edit Subscription</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        {loading ? <div className="text-center p-3"><Spinner /></div> : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Choose Plan</Lang> (*) :</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={formData.plan_id}
                                        onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                                    >
                                        <option value="" disabled>{t("Select a plan")}</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.description} ({p.duration} {t("Months")} - {p.price} DH)</option>
                                        ))}
                                    </select>
                                </div>
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
