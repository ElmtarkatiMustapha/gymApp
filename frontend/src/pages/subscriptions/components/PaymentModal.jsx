import { useEffect, useState } from "react";
import api from "../../../api/api";
import { Lang } from "../../../assets/js/lang";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { useAppAction } from "../../../context/context";

export function PaymentModal({ handleClose, onPaymentAdded, subscription }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const appAction = useAppAction();
    const remainingAmount = Number(subscription?.remaining_amount || 0);

    useEffect(() => {
        setAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : "");
    }, [subscription?.id, remainingAmount]);

    if (!subscription) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const numericAmount = Number(amount);

        if (numericAmount <= 0 || numericAmount > remainingAmount) {
            appAction({ type: "SET_ERROR", payload: "Payment must be greater than zero and cannot exceed the remaining amount" });
            return;
        }

        try {
            setLoading(true);
            await api.post(`/subscriptions/${subscription.id}/payments`, {
                amount: numericAmount,
            });
            appAction({ type: "SET_SUCCESS", payload: "Payment saved successfully" });
            await onPaymentAdded?.();
            handleClose();
        } catch (error) {
            appAction({
                type: "SET_ERROR",
                payload: error?.response?.data?.message || "Failed to save payment",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editModal modal z-3 d-block" data-bs-backdrop="static" tabIndex="-1">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <form className="modal-content" onSubmit={handleSubmit}>
                    <div className="modal-header text-primary-c">
                        <div>
                            <h6 className="modal-title fw-bold"><Lang>Add payment</Lang></h6>
                            <small className="text-muted">{subscription.customer?.name}</small>
                        </div>
                        <button type="button" className="btn-close" onClick={handleClose}><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        <div className="row mb-3">
                            <div className="col-6">
                                <strong><Lang>Total price</Lang>:</strong> {Number(subscription.price || 0).toFixed(2)} DH
                            </div>
                            <div className="col-6">
                                <strong><Lang>Remaining amount</Lang>:</strong> {remainingAmount.toFixed(2)} DH
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold"><Lang>Amount paid</Lang> (*)</label>
                            <input
                                type="number"
                                className="form-control"
                                min="0.01"
                                max={remainingAmount}
                                step="0.01"
                                required
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                            />
                        </div>
                        <div className="alert alert-light border mb-0">
                            <Lang>Payment date</Lang>: <strong><Lang>Today</Lang></strong>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}><Lang>Close</Lang></button>
                        <ButtonBlue label={<Lang>Save payment</Lang>} disabled={loading} type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
}
