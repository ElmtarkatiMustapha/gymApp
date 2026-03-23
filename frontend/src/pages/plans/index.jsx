import { useState, useEffect } from "react";
import { ButtonBlue } from "../../components/ButtonBlue";
import { useAppAction, useAppState } from "../../context/context";
import { SelectAction } from "../../components/SelectAction";
import api from "../../api/api";
import { CustomLoader } from "../../components/CustomLoader";
import { AddModal } from "./components/AddModal";
import { ViewModal } from "./components/ViewModal";
import { EditModal } from "./components/EditModal";
import { SelectActionTrans } from "../../components/SelectActionTrans";
import { Lang } from "../../assets/js/lang";

export function Plans() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [editedPlanId, setEditedPlanId] = useState(null);

    const appState = useAppState();
    const appAction = useAppAction();

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await api.get('/plans');
            if (response.data && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleAction = (e) => {
        const action = e.target.value;
        const id = e.target.getAttribute("data-id");
        const plan = data.find(p => p.id == id);

        if (action === "view") {
            setSelectedPlan(plan);
            setShowViewModal(true);
        } else if (action === "edit") {
            setEditedPlanId(id);
            setShowEditModal(true);
        } else if (action === "remove") {
            if (window.confirm(appState.langData["Are you sure you want to remove this plan?"] || "Are you sure you want to remove this plan?")) {
                setLoading(true);
                api.delete(`/plans/${id}`)
                    .then(() => {
                        appAction({ type: "SET_SUCCESS", payload: "Plan removed successfully" });
                        fetchPlans();
                    })
                    .catch(error => {
                        appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || "Failed to remove plan" });
                        setLoading(false);
                    });
            }
        }
        e.target.value = "default";
    };

    return (
        <>
            <div className="container-fluid page">
                <div className="row header-page p-0 m-2">
                    <div className="col-12 col-sm-12 col-md-6 p-0">
                        <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Plans</Lang></div>
                    </div>
                    <div className="col-6 col-sm-6 col-md-6 p-0 text-end d-flex justify-content-end align-items-end">
                        <div className="d-inline-block p-2 pe-0 ">
                            <ButtonBlue label="Add New" handleClick={() => setShowAddModal(true)} type={"button"} />
                        </div>
                    </div>
                </div>
                <div className="row p-2 m-0">
                    {loading && data.length === 0 ? (
                        <CustomLoader />
                    ) : (
                        data.map((plan, index) => {
                            return (
                                <div key={plan.id} className="col-12 col-sm-12 col-md-4 p-2">
                                    <div
                                        className="rounded-3 p-3 shadow-sm border"
                                        style={{
                                            backgroundColor: plan.color,
                                            color: "#ffffff",
                                            minHeight: "180px",
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                    >
                                        <div className="container-fluid p-0 align-items-center mb-2">
                                            <div className="row m-0">
                                                <div className="col-8 p-0">
                                                    <h5 className="fw-bold m-0 text-white text-truncate">{plan.title}</h5>
                                                </div>
                                                <div className="col-4 p-0 text-end">
                                                    <SelectActionTrans
                                                        options={appState.selectData}
                                                        id={plan.id}
                                                        onChange={handleAction}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-1 pb-1">
                                            <strong><Lang>Duration</Lang>:</strong> {plan.duration} <Lang>Month</Lang>
                                        </div>
                                        <div className="pt-1 pb-1">
                                            <strong><Lang>Price</Lang>:</strong> {plan.price} DH
                                        </div>
                                        <div className="pt-1 pb-1 flex-grow-1 text-truncate-2" title={plan.description}>
                                            <strong><Lang>Description</Lang>:</strong> {plan.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {showAddModal && <AddModal handleClose={() => setShowAddModal(false)} onPlanAdded={fetchPlans} />}
            {showViewModal && <ViewModal handleClose={() => setShowViewModal(false)} plan={selectedPlan} />}
            {showEditModal && <EditModal handleClose={() => setShowEditModal(false)} editedPlanId={editedPlanId} onPlanEdited={fetchPlans} />}
        </>
    );
}
