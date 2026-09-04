import { Lang } from "../../../assets/js/lang";
import { safeFormatDate } from "../../../utils/dateFormat";

export function ViewModal({ handleClose, insurance }) {
    if (!insurance) return null;

    return (
        <div className="editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0">
                                <Lang>Insurance details</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close"><span className="visually-hidden"><Lang>Close</Lang></span></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary-c border-bottom pb-2"><Lang>Customer Information</Lang></h6>
                            <div className="row">
                                <div className="col-12 mb-2"><strong><Lang>Name</Lang>:</strong> {insurance.customer?.name}</div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary-c border-bottom pb-2"><Lang>Insurance Information</Lang></h6>
                            <div className="row">
                                <div className="col-6 mb-2"><strong><Lang>Price</Lang>:</strong> {insurance.price} DH</div>
                                <div className="col-6 mb-2"><strong><Lang>Payed at</Lang>:</strong> {safeFormatDate(insurance.created_at, 'N/A')}</div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary-c border-bottom pb-2"><Lang>Dates</Lang></h6>
                            <div className="row">
                                <div className="col-6 mb-2"><strong><Lang>Start at</Lang>:</strong> {safeFormatDate(insurance.start_at, 'N/A')}</div>
                                <div className="col-6 mb-2"><strong><Lang>Expire at</Lang>:</strong> {safeFormatDate(insurance.expire_at, 'N/A')}</div>
                                <div className="col-12 mb-2"><strong><Lang>State</Lang>:</strong> <span className={`badge ${insurance.state === 'Active' ? 'bg-success' : 'bg-danger'}`}><Lang>{insurance.state}</Lang></span></div>
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
