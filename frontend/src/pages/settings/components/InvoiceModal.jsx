import { useState } from "react";
import { useAppAction } from "../../../context/context";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";

export function InvoiceModal({ data, onClose, onUpdate }) {
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
                invoiceSettings: formData
            };
            await api.post('/settings', payload);
            appAction({ type: "SET_SUCCESS", payload: "Invoice settings updated successfully" });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            appAction({ type: "SET_ERROR", payload: "Failed to update invoice settings" });
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
                                <Lang>Edit Invoice Settings</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Header</Lang> (*) :</label>
                            <textarea className="form-control" name="header" value={formData.header} onChange={handleChange} rows="4" required placeholder="Business address, RC, ICE..."></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Footer</Lang> (*) :</label>
                            <textarea className="form-control" name="footer" value={formData.footer} onChange={handleChange} rows="4" required placeholder="Terms and conditions, bank account..."></textarea>
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
