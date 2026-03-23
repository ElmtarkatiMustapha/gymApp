import { Lang } from "../../../assets/js/lang";

export function ViewModal({ handleClose, plan }) {
    if (!plan) return null;

    return (
        <div className="addModal editModal modal z-2 d-block" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen-md-down modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-between text-primary-c">
                        <div className="modal-title">
                            <div className="title h6 fw-bold m-0" style={{ color: "var(--primary-color)" }}>
                                <Lang>Plan Details</Lang> :
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Title</Lang> :</label>
                            <div className="p-2 bg-light border rounded">{plan.title}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Price</Lang> :</label>
                            <div className="p-2 bg-light border rounded">{plan.price} DH</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Duration</Lang> :</label>
                            <div className="p-2 bg-light border rounded">{plan.duration} Month</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Description</Lang> :</label>
                            <div className="p-2 bg-light border rounded" style={{ minHeight: '100px' }}>{plan.description || 'No description'}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label h6 fw-bold"><Lang>Color</Lang> :</label>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle border" style={{ backgroundColor: plan.color, width: '30px', height: '30px' }}></div>
                                <span>{plan.color}</span>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}><Lang>Close</Lang></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
