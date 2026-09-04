import { useState } from "react";
import { useAppAction } from "../../../context/context";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";

export function EmailMessagesModal({ data, onClose, onUpdate }) {
    const [formData, setFormData] = useState({ ...data });
    const [loading, setLoading] = useState(false);
    const appAction = useAppAction();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                messageTemplate: formData
            };
            await api.post('/settings', payload);
            appAction({ type: "SET_SUCCESS", payload: "Email templates updated successfully" });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            appAction({ type: "SET_ERROR", payload: "Failed to update email templates" });
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
                                <Lang>Edit Email Messages</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Pre-expiration message</Lang> (*) :</label>
                            <textarea className="form-control" name="preExpiration" value={formData.preExpiration} onChange={handleChange} rows="4" required></textarea>
                            <div className="form-text small opacity-75"><code className="fw-bold">{`{name}`}</code>, <code className="fw-bold">{`{plan_name}`}</code>, <code className="fw-bold">{`{expiry_date}`}</code> <Lang>as placeholders</Lang>.</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Expiration message</Lang> (*) :</label>
                            <textarea className="form-control" name="expiration" value={formData.expiration} onChange={handleChange} rows="4" required></textarea>
                            <div className="form-text small opacity-75"><code className="fw-bold">{`{name}`}</code>, <code className="fw-bold">{`{plan_name}`}</code>, <code className="fw-bold">{`{expiry_date}`}</code> <Lang>as placeholders</Lang>.</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Welcome message</Lang> (*) :</label>
                            <textarea className="form-control" name="welcome" value={formData.welcome} onChange={handleChange} rows="4" required></textarea>
                            <div className="form-text small opacity-75"><code className="fw-bold">{`{name}`}</code>, <code className="fw-bold">{`{plan_name}`}</code>, <code className="fw-bold">{`{expiry_date}`}</code> <Lang>as placeholders</Lang>.</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Success Payment message</Lang> (*) :</label>
                            <textarea className="form-control" name="successPayment" value={formData.successPayment} onChange={handleChange} rows="4" required></textarea>
                            <div className="form-text small opacity-75"><code className="fw-bold">{`{name}`}</code>, <code className="fw-bold">{`{plan_name}`}</code>, <code className="fw-bold">{`{expiry_date}`}</code> <Lang>as placeholders</Lang>.</div>
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
