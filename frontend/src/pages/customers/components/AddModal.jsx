import { useState, useEffect } from "react";
import { CustomerInfo } from "./CustomerInfo";
import { ChoosePlan } from "./ChoosePlan";
import api from "../../../api/api";
import { useAppAction } from "../../../context/context";
// import { toast } from "react-hot-toast";

export function AddModal({ handleClose, onCustomerAdded }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const appAction = useAppAction()

    const [formData, setFormData] = useState({
        name: "",
        cin: "",
        phone: "",
        email: "",
        adresse: "",
        sexe: "male",
        birthday: "",
        plan: "",
        insurance: false,
        start_at: new Date().toISOString().split('T')[0],
        payment_type: "",
        amount_paid: "",
        state: 1
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setPlansLoading(true);
                const response = await api.get('/plans');
                if (response.data && response.data.data) {
                    setPlans(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch plans:", error);
                appAction({ type: "SET_ERROR", payload: "Failed to load plans" });
            } finally {
                setPlansLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleNext = () => {
        setStep(2);
    };

    const handlePrevious = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await api.post('/customers', formData);
            if (response.data && response.data.data) {
                // if (window.toast) window.toast.success("Customer added successfully!");
                appAction({ type: "SET_SUCCESS", payload: "Customer added successfully!" });
                if (onCustomerAdded) {
                    onCustomerAdded(response.data.data);
                }
                handleClose();
            }
        } catch (error) {
            // console.error("Failed to add customer:", error);
            appAction({ type: "SET_ERROR", payload: error.response.data.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down  modal-dialog-scrollable">
                {step === 1 ? (
                    <CustomerInfo
                        handleClose={handleClose}
                        onNext={handleNext}
                        formData={formData}
                        setFormData={setFormData}
                        loading={loading}
                    />
                ) : (
                    <ChoosePlan
                        plans={plans}
                        formData={formData}
                        setFormData={setFormData}
                        onPrevious={handlePrevious}
                        onSubmit={handleSubmit}
                        loading={loading}
                        plansLoading={plansLoading}
                    />
                )}
            </div>
        </div>
    )
}
