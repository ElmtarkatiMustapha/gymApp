import { useState, useEffect, useRef } from "react";
import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { Spinner } from "../../../components/Spinner";
import { ButtonBlue } from "../../../components/ButtonBlue";
import api from "../../../api/api";
import { format } from "date-fns";

export function AddModal({ handleClose, onSubscriptionAdded, preselectedCustomer }) {
    const [step, setStep] = useState(preselectedCustomer ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer || null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const appAction = useAppAction();
    const appState = useAppState();

    // Fetch customers on search
    useEffect(() => {
        if (step === 1 && !preselectedCustomer) {
            const delayDebounceFn = setTimeout(() => {
                fetchCustomers();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [search, step, preselectedCustomer]);

    // Fetch plans once
    useEffect(() => {
        api.get("/plans").then(res => {
            setPlans(res.data.data);
        });
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/customers", { params: { search } });
            setCustomers(res.data.data.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (selectedCustomer) setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || !selectedPlan) return;

        setLoading(true);
        try {
            await api.post("/subscriptions", {
                customer_id: selectedCustomer.id,
                plan_id: selectedPlan.id,
                start_at: startDate
            });
            appAction({ type: "SET_SUCCESS", payload: "Subscription added successfully" });
            onSubscriptionAdded();
            handleClose();
        } catch (err) {
            appAction({ type: "SET_ERROR", payload: err?.response?.data?.message || "Failed to add subscription" });
        } finally {
            setLoading(false);
        }
    };

    const t = (key) => appState.langData[key] || key;

    return (
        <div className="addModal editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0" style={{ color: "var(--primary-color)" }}>
                                <Lang>Add New Subscription</Lang> (Step {step}/2) :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {step === 1 ? (
                            <>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Search Customer</Lang> (Name or CIN) :</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Search...")}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="list-group">
                                    {loading && <div className="text-center p-2"><Spinner /></div>}
                                    {!loading && customers.length === 0 && <div className="text-center p-2"><Lang>No customers found</Lang></div>}
                                    {customers.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className={`list-group-item list-group-item-action ${selectedCustomer?.id === c.id ? "active" : ""}`}
                                            onClick={() => setSelectedCustomer(c)}
                                        >
                                            <div className="d-flex w-100 justify-content-between">
                                                <h6 className="mb-1">{c.name}</h6>
                                                <small>{c.cin}</small>
                                            </div>
                                            <small>{c.email}</small>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-3 p-2 bg-light rounded border">
                                    <h6 className="fw-bold mb-1"><Lang>Selected Customer</Lang>:</h6>
                                    <div>{selectedCustomer?.name} ({selectedCustomer?.cin})</div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Choose Plan</Lang> (*) :</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={selectedPlan?.id || ""}
                                        onChange={(e) => setSelectedPlan(plans.find(p => p.id == e.target.value))}
                                    >
                                        <option value="" disabled>{t("Select a plan")}</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.description} ({p.duration} mois - {p.price} DH)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label h6 fw-bold"><Lang>Start Date</Lang> (*) :</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
                        {step === 2 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}><Lang>Back</Lang></button>
                        )}
                        <div className="ms-auto">
                            {step === 1 ? (
                                <ButtonBlue label={"Next"} disabled={!selectedCustomer} handleClick={handleNext} type={"button"} />
                            ) : (
                                <ButtonBlue label={"Save"} disabled={loading || !selectedPlan} handleClick={handleSubmit} type={"button"} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
