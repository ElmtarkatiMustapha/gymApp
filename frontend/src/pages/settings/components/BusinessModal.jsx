import { useState } from "react";
import { useAppAction } from "../../../context/context";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { UploadImage } from "../../../components/UploadImage";

export function BusinessModal({ data, onClose, onUpdate }) {
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
            const form = new FormData(e.target);
            const logoFile = form.get('picture');

            const submitData = new FormData();

            // Map businessInfo fields as a JSON string for the backend to decode
            const businessInfo = {
                name: formData.name,
                city: formData.city,
                adresse: formData.adresse,
                phone: formData.phone,
                email: formData.email,
            };

            submitData.append('businessInfo', JSON.stringify(businessInfo));

            // If new image uploaded, add it to submitData
            if (logoFile && logoFile.size > 0) {
                submitData.append('picture', logoFile);
            }

            await api.post('/settings', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            appAction({ type: "SET_SUCCESS", payload: "Business info updated successfully" });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            appAction({ type: "SET_ERROR", payload: "Failed to update business info" });
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
                                <Lang>Edit Business Infos</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Name</Lang> (*) :</label>
                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label h6 fw-bold"><Lang>City</Lang> (*) :</label>
                                <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label h6 fw-bold"><Lang>Phone</Lang> (*) :</label>
                                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Adresse</Lang> (*) :</label>
                            <input type="text" className="form-control" name="adresse" value={formData.adresse} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Email</Lang> (*) :</label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Logo</Lang> :</label>
                            <UploadImage image={formData.logo} loading={loading} />
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
