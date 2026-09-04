import { useState } from "react";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { Spinner } from "../../../components/Spinner";
import api from "../../../api/api";
import { useAppAction, useAppState } from "../../../context/context";
// import { toast } from "react-hot-toast";

export function AddModal({ handleClose, onPlanAdded }) {
    const [loading, setLoading] = useState(false);
    const appAction = useAppAction()
    const appState = useAppState();
    const t = (key) => appState.langData[key] || key;
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        duration: "",
        color: "#563d7c",
        description: "" // we'll merge this conceptually if needed, or simply send exactly as payload
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Construct payload mapping Title -> description for the backend
            // Because the backend expects: description (string), duration (int), price (numeric)
            // If they provided an actual description, we can append it or ignore it depending on needs.
            // Let's just use title as description, and ignore the detailed description for the DB.
            const payload = {
                title: formData.title, // Maps Title input to backend matching our workaround
                description: formData.title, // Maps Title input to backend matching our workaround
                duration: parseInt(formData.duration, 10),
                price: parseFloat(formData.price),
                color: formData.color, // Maps Title input to backend matching our workaround
            };

            const response = await api.post('/plans', payload);
            if (response.data && response.data.data) {
                // if (window.toast) window.toast.success("Plan added successfully!");
                appAction({ type: "SET_SUCCESS", payload: "Plan added successfully!" });
                if (onPlanAdded) {
                    onPlanAdded(response.data.data);
                }
                handleClose();
            }
        } catch {
            // console.error("Failed to add plan:", error.message);
            appAction({ type: "SET_ERROR", payload: "Failed to add plan. Please check the fields" });
            // if (window.toast) window.toast.error("Failed to add plan. Please check the fields.");
            // else alert("Failed to add plan");
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
                                <Lang>Add Plan</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Title</Lang> (*) : {loading && <Spinner />}</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="form-control"
                                placeholder={t("Ex: Basic")}
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
                                disabled={loading}
                                className="form-control"
                                placeholder={t("Tap price")}
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
                                disabled={loading}
                                className="form-control"
                                placeholder={t("Tap duration")}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Description</Lang> :</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                disabled={loading}
                                className="form-control"
                                placeholder={t("Tap Description")}
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
                                disabled={loading}
                                className="form-control form-control-color"
                            />
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
