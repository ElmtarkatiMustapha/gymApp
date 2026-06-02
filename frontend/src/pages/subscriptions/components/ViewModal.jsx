import { Lang } from "../../../assets/js/lang";
import { safeFormatDate } from "../../../utils/dateFormat";

export function ViewModal({ handleClose, subscription }) {
    if (!subscription) return null;

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0">
                                <Lang>Subscription details</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary-c border-bottom pb-2"><Lang>Customer Information</Lang></h6>
                            <div className="row">
                                <div className="col-6 mb-2"><strong><Lang>Name</Lang>:</strong> {subscription.customer?.name}</div>
                                <div className="col-6 mb-2"><strong><Lang>Sexe</Lang>:</strong> {subscription.customer?.sexe}</div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary-c border-bottom pb-2"><Lang>Plan Information</Lang></h6>
                            <div className="row">
                                <div className="col-6 mb-2"><strong><Lang>Description</Lang>:</strong> {subscription.plan?.name}</div>
                                <div className="col-6 mb-2"><strong><Lang>Price</Lang>:</strong> {subscription.price} DH</div>
                                <div className="col-12 mb-2">
                                    <strong><Lang>Color</Lang>:</strong>
                                    <span className="ms-2 px-3 py-1 rounded border" style={{ backgroundColor: subscription.plan?.color }}>&nbsp;</span>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary-c border-bottom pb-2"><Lang>Subscription Dates</Lang></h6>
                            <div className="row">
                                <div className="col-6 mb-2"><strong><Lang>Start at</Lang>:</strong> {safeFormatDate(subscription.start_at, 'N/A')}</div>
                                <div className="col-6 mb-2"><strong><Lang>Expire at</Lang>:</strong> {safeFormatDate(subscription.expire_at, 'N/A')}</div>
                                <div className="col-12 mb-2"><strong><Lang>State</Lang>:</strong> <span className={`badge ${subscription.state === 'Active' ? 'bg-success' : 'bg-danger'}`}>{subscription.state}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}><Lang>Close</Lang></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
