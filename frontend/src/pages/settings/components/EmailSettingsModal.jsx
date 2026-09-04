import { useState } from "react";
import { useAppAction } from "../../../context/context";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";

export function EmailSettingsModal({ data, onClose, onUpdate }) {
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
                emailSettings: formData
            };
            await api.post('/settings', payload);
            appAction({ type: "SET_SUCCESS", payload: "Email settings updated successfully" });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            appAction({ type: "SET_ERROR", payload: "Failed to update email settings" });
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
                                <Lang>Edit Email Settings</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>SMTP Server</Lang> (*) :</label>
                            <input type="text" className="form-control" name="host" value={formData.host} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Port</Lang> (*) :</label>
                            <input type="number" className="form-control" name="port" value={formData.port} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Username</Lang> (*) :</label>
                            <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Password</Lang> (*) :</label>
                            <input type="password" placeholder="********" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
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
