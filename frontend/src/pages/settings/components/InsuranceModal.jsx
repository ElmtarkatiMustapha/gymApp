import { useState } from "react";
import { useAppAction } from "../../../context/context";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";

export function InsuranceModal({ data, onClose, onUpdate }) {
    const [formData, setFormData] = useState({ ...data });
    const [loading, setLoading] = useState(false);
    const appAction = useAppAction();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                insurance: {
                    price: parseFloat(formData.price),
                    periode: parseInt(formData.periode)
                }
            };
            await api.post('/settings', payload);
            appAction({ type: "SET_SUCCESS", payload: "Insurance settings updated successfully" });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            appAction({ type: "SET_ERROR", payload: "Failed to update insurance settings" });
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
                                <Lang>Edit Insurance Settings</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Insurance Amount</Lang> (*) :</label>
                            <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Insurance Period (Months)</Lang> (*) :</label>
                            <input type="number" className="form-control" name="periode" value={formData.periode} onChange={handleChange} required />
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
