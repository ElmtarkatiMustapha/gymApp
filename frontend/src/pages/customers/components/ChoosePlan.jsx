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
        onSubmit();
    };

    const getDurationLabel = (months) => {
        if (months >= 12) {
            const years = Math.floor(months / 12);
            return years === 1 ? "1 An" : `${years} Ans`;
        }
        return `${months} Month`;
    };

    return (
        <form onSubmit={handleSubmit} className="modal-content">
            <div className="modal-header d-flex justify-content-between text-primary-c">
                <div className="modal-title">
                    <div className="title h3 m-0"><Lang>Add Customer</Lang></div>
                    <div className="sub-title"><Lang>Chose Plan</Lang></div>
                </div>
                <button type="button" onClick={onPrevious} className="btn-close" aria-label="Close"></button>
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
                                        <div>Duration: {getDurationLabel(plan.duration)}</div>
                                        <div>Price: {plan.price} DH</div>
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
                                placeholder="Ex: 16/02/2026"
                                required
                            />
                        </div>
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
