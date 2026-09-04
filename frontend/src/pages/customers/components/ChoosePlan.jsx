import { Lang } from "../../../assets/js/lang"
import { ButtonBlue } from "../../../components/ButtonBlue"
import { Spinner } from "../../../components/Spinner"
import { useAppState } from "../../../context/context";

const planColors = ["primary", "orange", "gold"];

export function ChoosePlan({ plans, formData, setFormData, onPrevious, onSubmit, loading, plansLoading }) {
    const state = useAppState()
    const handlePlanSelect = (planId) => {
        setFormData(prev => ({ ...prev, plan: planId }));
    };

    const handleInsuranceToggle = () => {
        setFormData(prev => ({ ...prev, insurance: !prev.insurance }));
    };

    const handleStartAtChange = (e) => {
        setFormData(prev => ({ ...prev, start_at: e.target.value }));
    };

    const selectedPlan = plans.find(plan => String(plan.id) === String(formData.plan));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.plan) {
            alert("Please select a plan");
            return;
        }
        if (!formData.start_at) {
            alert("Please enter a start date");
            return;
        }
        if (!formData.payment_type) {
            alert(state.langData["Please select payment type"] || "Please select payment type");
            return;
        }
        if (formData.payment_type === "partial" && (!formData.amount_paid || Number(formData.amount_paid) >= Number(selectedPlan?.price))) {
            alert(state.langData["Partial payment must be greater than zero and less than the total price"] || "Partial payment must be greater than zero and less than the total price");
            return;
        }
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-content">
            <div className="modal-header d-flex justify-content-between text-primary-c">
                <div className="modal-title">
                    <div className="title h3 m-0"><Lang>Add Customer</Lang></div>
                    <div className="sub-title"><Lang>Chose Plan</Lang></div>
                </div>
                <button type="button" onClick={onPrevious} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
            </div>
            <div className="modal-body">
                {plansLoading ? (
                    <div className="text-center p-4"><Spinner /></div>
                ) : (
                    <>
                        <div className="plans-container d-flex flex-wrap gap-3 mb-4">
                            {plans.map((plan, index) => (
                                <div
                                    key={plan.id}
                                    className={`plan-card plan-card-${planColors[index % planColors.length]} ${formData.plan === plan.id ? 'selected' : ''}`}
                                    onClick={() => handlePlanSelect(plan.id)}
                                >
                                    <div className="plan-card-header">
                                        <span className="plan-card-title">{plan.title}</span>
                                        <span className="plan-card-radio">
                                            <input
                                                type="radio"
                                                name="plan"
                                                checked={formData.plan === plan.id}
                                                onChange={() => handlePlanSelect(plan.id)}
                                                className="form-check-input"
                                            />
                                        </span>
                                    </div>
                                    <div className="plan-card-body">
                                        <div><Lang>Duration</Lang>: {plan.duration} <Lang>Months</Lang></div>
                                        <div><Lang>Price</Lang>: {plan.price} DH</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-3 d-flex align-items-center gap-2">
                            <span className="fw-semibold"><Lang>Isurance</Lang>: {state.settings.insurance.price}DH</span>
                            <div className="insurance-toggle" onClick={handleInsuranceToggle}>
                                <div className={`toggle-track ${formData.insurance ? 'active' : ''}`}>
                                    <div className="toggle-thumb"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Start At</Lang>* :</label>
                            <input
                                type="date"
                                disabled={loading}
                                name="start_at"
                                value={formData.start_at}
                                onChange={handleStartAtChange}
                                className="form-control"
                                placeholder={state.langData["Ex: 16/02/2026"] || "Ex: 16/02/2026"}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label h5"><Lang>Payment</Lang>* :</label>
                            <select
                                className="form-select"
                                required
                                value={formData.payment_type}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    payment_type: e.target.value,
                                    amount_paid: ""
                                }))}
                            >
                                <option value="" disabled>{state.langData["Select payment type"] || "Select payment type"}</option>
                                <option value="full">{state.langData["Paid in full"] || "Paid in full"}</option>
                                <option value="partial">{state.langData["Partial payment"] || "Partial payment"}</option>
                            </select>
                        </div>
                        {formData.payment_type === "partial" && (
                            <div className="mb-3">
                                <label className="form-label h5"><Lang>Amount paid</Lang>* :</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    max={Math.max(Number(selectedPlan?.price || 0) - 0.01, 0.01)}
                                    step="0.01"
                                    required
                                    className="form-control"
                                    value={formData.amount_paid}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount_paid: e.target.value }))}
                                />
                                <small className="text-muted">
                                    <Lang>Remaining amount</Lang>: {Math.max(Number(selectedPlan?.price || 0) - Number(formData.amount_paid || 0), 0).toFixed(2)} DH
                                </small>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="modal-footer d-flex justify-content-between">
                <button type="button" className="btn btn-outline-danger fw-bold px-4 rounded-pill" onClick={onPrevious}>
                    <Lang>Previous</Lang>
                </button>
                <ButtonBlue label={"Submit"} disabled={loading || plansLoading} type={"submit"} />
            </div>
        </form>
    )
}
