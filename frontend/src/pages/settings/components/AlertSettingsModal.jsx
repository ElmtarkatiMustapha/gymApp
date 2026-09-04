import { useState } from "react";
import { useAppAction } from "../../../context/context";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";

export function AlertSettingsModal({ data, onClose, onUpdate }) {
    const [formData, setFormData] = useState({ ...data });
    const [loading, setLoading] = useState(false);
    const appAction = useAppAction();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                alertSettings: formData
            };
            await api.post('/settings', payload);
            appAction({ type: "SET_SUCCESS", payload: "Alert settings updated successfully" });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            appAction({ type: "SET_ERROR", payload: "Failed to update alert settings" });
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
                                <Lang>Edit Alert Settings</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="form-check form-switch mb-4">
                            <input className="form-check-input" type="checkbox" name="autoNotice" checked={formData.autoNotice} onChange={handleChange} id="autoNoticeSwitch" />
                            <label className="form-check-label h6 fw-bold" htmlFor="autoNoticeSwitch"><Lang>Auto Notification</Lang></label>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Days before expiration</Lang> (*) :</label>
                            <input type="number" className="form-control" name="days_before_expiration" value={formData.days_before_expiration} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Pre-expire Alert Times</Lang> (*) :</label>
                            <input type="number" className="form-control" name="pre_expire_times" value={formData.pre_expire_times} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Expired alert times</Lang> (*) :</label>
                            <input type="number" className="form-control" name="expire_times" value={formData.expire_times} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Periode between alert (days)</Lang> (*) :</label>
                            <input type="number" className="form-control" name="days_between_alerts" value={formData.days_between_alerts} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-end">
                        <ButtonBlue type="submit" label="Save Changes" disabled={loading} />
                    </div>
                </form>
            </div>
        </div>
    );
}
