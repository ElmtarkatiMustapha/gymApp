import { useState, useEffect } from "react";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { Spinner } from "../../../components/Spinner";
import api from "../../../api/api";
import { useAppAction } from "../../../context/context";

export function EditModal({ handleClose, onPlanEdited, editedPlanId }) {
    const [loading, setLoading] = useState(true);
    const appAction = useAppAction();

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        duration: "",
        color: "#563d7c",
        description: ""
    });

    useEffect(() => {
        if (editedPlanId) {
            setLoading(true);
            api.get(`/plans/${editedPlanId}`)
                .then(res => {
                    const plan = res.data.data;
                    setFormData({
                        title: plan.title || "",
                        price: plan.price || "",
                        duration: plan.duration || "",
                        color: plan.color || "#563d7c",
                        description: plan.description || ""
                    });
                    setLoading(false);
                })
                .catch(err => {
                    appAction({ type: "SET_ERROR", payload: "Failed to fetch plan data" });
                    handleClose();
                });
        }
    }, [editedPlanId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                title: formData.title,
                description: formData.description || formData.title,
                duration: parseInt(formData.duration, 10),
                price: parseFloat(formData.price),
                color: formData.color,
            };

            const response = await api.post(`/plans/update/${editedPlanId}`, payload);
            if (response.data && response.data.data) {
                appAction({ type: "SET_SUCCESS", payload: "Plan updated successfully!" });
                if (onPlanEdited) onPlanEdited();
                handleClose();
            }
        } catch (error) {
            appAction({ type: "SET_ERROR", payload: "Failed to update plan" });
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
                                <Lang>Edit Plan</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        {loading ? <div className="text-center p-3"><Spinner /></div> : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Title</Lang> (*) :</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Price</Lang> (*) :</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Duration Month</Lang> (*) :</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Description</Lang> :</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="form-control"
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Color</Lang> (*) :</label>
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        required
                                        className="form-control form-control-color w-100"
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
