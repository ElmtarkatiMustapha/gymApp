import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { FilterDate } from "../../../components/FilterDate";
import { DateRangeModal } from "../../../components/DateRangeModal";
import { CustomDataTable } from "../../../components/CustomDataTable";
import { CustomLoader } from "../../../components/CustomLoader";
import { format } from "date-fns";
import { safeFormatDate } from "../../../utils/dateFormat";
import { FaEdit, FaPlus, FaPrint } from "react-icons/fa";
import { EditModal as CustomerEditModal } from "../components/EditModal";
import { AddModal as SubscriptionAddModal } from "../../subscriptions/components/AddModal";
import { EditModal as SubscriptionEditModal } from "../../subscriptions/components/EditModal";
import { AddModal as InsuranceAddModal } from "../../insurances/components/AddModal";
import { EditModal as InsuranceEditModal } from "../../insurances/components/EditModal";
import "../../../assets/css/pages.css";
import { ButtonBlue } from "../../../components/ButtonBlue";
import { printCustomerFile } from "../../../utils/printCustomerFile";

export function SingleCustomer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const appState = useAppState();
    const appAction = useAppAction();

    const [loading, setLoading] = useState(true);
    const [customerData, setCustomerData] = useState(null);
    const [activePlan, setActivePlan] = useState(null);
    const [subscriptionsHistory, setSubscriptionsHistory] = useState([]);
    const [insurancesHistory, setInsurancesHistory] = useState([]);

    const [filter, setFilter] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);

    const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);
    const [showSubAddModal, setShowSubAddModal] = useState(false);
    const [showSubEditModal, setShowSubEditModal] = useState(false);
    const [showInsAddModal, setShowInsAddModal] = useState(false);
    const [showInsEditModal, setShowInsEditModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handlePrintCustomerFile = () => {
        printCustomerFile({
            customerData,
            activePlan,
            subscriptionsHistory,
            insurancesHistory,
            settings: appState.settings,
            langData: appState.langData,
            currentLang: appState.currentLang,
        });
    };

    const getSubscriptionState = (row) => {
        const now = new Date();
        const start = new Date(row.start_at);
        const expire = new Date(row.expire_at);
        if (start > now) return { label: 'Upcoming', class: 'text-warning' };
        if (expire < now) return { label: 'Expired', class: 'text-danger' };
        if (Math.ceil((expire - now) / (1000 * 60 * 60 * 24)) <= 7) return { label: 'Pre-expire', class: 'text-warning' };
        return { label: 'Active', class: 'text-success' };
    };

    const subscriptionColumns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '70px' },
        { name: 'Plan', selector: row => row.plan?.description || 'N/A' },
        { name: 'Duration', selector: row => (row.duration || 0) + " mois" },
        { name: 'Total (DH)', selector: row => row.price },
        { name: 'Start at', selector: row => row.start_at, cell: row => safeFormatDate(row.start_at), sortable: true },
        { name: 'Expire at', selector: row => row.expire_at, cell: row => safeFormatDate(row.expire_at), sortable: true },
        { name: 'Payed at', selector: row => row.created_at, cell: row => safeFormatDate(row.created_at, 'N/A'), sortable: true },
        {
            name: 'State',
            selector: row => getSubscriptionState(row).label,
            cell: row => {
                const st = getSubscriptionState(row);
                return <span className={st.class}><Lang>{st.label}</Lang></span>;
            },
            sortable: true,
            width: '100px'
        },
        {
            name: 'Action',
            cell: row => (
                <button className="btn btn-sm text-primary" onClick={() => {
                    setSelectedId(row.id);
                    setShowSubEditModal(true);
                }}>
                    <FaEdit />
                </button>
            ),
            width: '80px'
        }
    ];

    const getInsuranceState = (row) => {
        const now = new Date();
        const expire = new Date(row.expire_at);
        return expire > now
            ? { label: 'Active', class: 'text-success' }
            : { label: 'Expired', class: 'text-danger' };
    };

    const insuranceColumns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '70px' },
        { name: 'Price (DH)', selector: row => row.price },
        { name: 'Duration', selector: row => (row.periode || 12) + " mois" },
        { name: 'Start at', selector: row => row.start_at, cell: row => safeFormatDate(row.start_at), sortable: true },
        { name: 'Expire at', selector: row => row.expire_at, cell: row => safeFormatDate(row.expire_at), sortable: true },
        { name: 'Payed at', selector: row => row.created_at, cell: row => safeFormatDate(row.created_at, 'N/A'), sortable: true },
        {
            name: 'State',
            selector: row => getInsuranceState(row).label,
            cell: row => {
                const st = getInsuranceState(row);
                return <span className={st.class}><Lang>{st.label}</Lang></span>;
            },
            sortable: true,
            width: '100px'
        },
        {
            name: 'Action',
            cell: row => (
                <button className="btn btn-sm text-primary" onClick={() => {
                    setSelectedId(row.id);
                    setShowInsEditModal(true);
                }}>
                    <FaEdit />
                </button>
            ),
            width: '80px'
        }
    ];

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await api({
                method: "get",
                url: `/customers/details/${id}`,
                params: { filter, startDate, endDate }
            });
            if (res.data && res.data.data) {
                setCustomerData(res.data.data.customer);
                setActivePlan(res.data.data.active_plan);
                setSubscriptionsHistory(res.data.data.subscriptions_history);
                setInsurancesHistory(res.data.data.insurances_history);
            }
        } catch (err) {
            appAction({ type: "SET_ERROR", payload: err?.response?.data?.message || "Failed to fetch customer details" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [filter, startDate, endDate, id]);



    const handleFilter = (e) => {
        if (e.target.value === "range") {
            setOpenCalendar(true);
        } else {
            setFilter(e.target.value);
        }
    };

    const handleSubmitRange = (e) => {
        e.preventDefault();
        setStartDate(format(selectionRange[0].startDate, "yyyy-MM-dd"));
        setEndDate(format(selectionRange[0].endDate, "yyyy-MM-dd"));
        setFilter("range");
        setOpenCalendar(false);
    };

    if (loading && !customerData) return <div className="text-center p-5"><CustomLoader /></div>;
    if (!customerData) return <div className="text-center p-5">Customer not found</div>;

    return (
        <>
            <div className="container-fluid p-0 page single-customer-page">
                <div className="row header-page p-0 m-2 mt-0">
                    <div className="col-6">
                        <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Customer</Lang>: {customerData.id}</div>
                    </div>
                    <div className="col-6 text-end d-flex justify-content-end align-items-center gap-2">
                        <button className="btn btn-blue rounded-pill pt-1 pb-1 fw-bold d-flex align-items-center gap-2" onClick={handlePrintCustomerFile}>
                            <FaPrint /> <span className="d-none d-sm-inline"><Lang>Print File</Lang></span>
                        </button>
                        <FilterDate onChange={handleFilter} filter={filter} />
                    </div>
                </div>

                <div className="row m-0 p-2">
                    <div className="col-md-9 p-2">
                        <div className="card h-100 border-0 shadow-sm p-4">
                            <div className="d-flex justify-content-between border-primary-c align-items-center p-0 border-bottom mb-3 pb-2">
                                <h4 className="fw-bold text-primary-c m-0"><Lang>Personal informations</Lang></h4>
                                <button className="btn btn-link text-primary-c p-0" onClick={() => setShowCustomerEditModal(true)}>
                                    <FaEdit size={24} />
                                </button>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>Name</Lang>:</span>
                                    <span className="text-muted">{customerData.name}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>Sexe</Lang>:</span>
                                    <span className="text-muted">{customerData.sexe}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>Birthday</Lang>:</span>
                                    <span className="text-muted">{safeFormatDate(customerData.birthday, 'N/A')}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>CIN</Lang>:</span>
                                    <span className="text-muted">{customerData.cin || 'N/A'}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>insurance</Lang>:</span>
                                    <span className={customerData.insurance_status === 'Active' ? "text-success fw-bold" : (customerData.insurance_status === 'Upcoming' ? "text-danger fw-bold" : "text-danger fw-bold")}>
                                        {customerData.insurance_status}
                                    </span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>Phone</Lang>:</span>
                                    <span className="text-muted">{customerData.phone || 'N/A'}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>Issurance expire at</Lang>:</span>
                                    <span className="text-muted">{safeFormatDate(customerData.insurance_expire_at, 'N/A')}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>Email</Lang>:</span>
                                    <span className="text-muted">{customerData.email}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <span className="fw-bold text-primary-c me-2"><Lang>State</Lang>:</span>
                                    <span className={customerData.state === 'Active' ? "text-success fw-bold" : "text-danger fw-bold"}>
                                        {customerData.state}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 p-2">
                        <div className="card h-100 border-0 shadow-sm text-white" style={{ backgroundColor: activePlan?.state === 'Upcoming' ? 'var(--danger-color)' : activePlan?.color || 'var(--primary-color)' }}>
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.3) !important' }}>
                                <h5 className="fw-bold m-0">{activePlan?.name || <Lang>No Active Plan</Lang>} {activePlan?.state === 'Upcoming' && <span className="badge bg-light text-danger ms-2"><Lang>Upcoming</Lang></span>}</h5>
                                {activePlan && (
                                    <button className="btn btn-link text-white p-0" onClick={() => {
                                        setSelectedId(activePlan.id);
                                        setShowSubEditModal(true);
                                    }}>
                                        <FaEdit size={20} />
                                    </button>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="mb-2">
                                    <span className="fw-bold me-2"><Lang>Duration</Lang>:</span>
                                    <span>{activePlan?.duration || 'N/A'}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="fw-bold me-2"><Lang>Price</Lang>:</span>
                                    <span>{activePlan?.price || 'N/A'}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="fw-bold me-2"><Lang>Start At</Lang>:</span>
                                    <span>{safeFormatDate(activePlan?.start_at, 'N/A')}</span>
                                </div>
                                <div className="mb-0">
                                    <span className="fw-bold me-2"><Lang>Expire At</Lang>:</span>
                                    <span>{safeFormatDate(activePlan?.expire_at, 'N/A')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row m-0 p-3">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                        <h5 className="fw-bold text-primary-c m-0"><Lang>Plan payement historic</Lang></h5>
                        <ButtonBlue label={"Add new"} handleClick={() => setShowSubAddModal(true)} type={"button"} />
                    </div>
                    <CustomDataTable columns={subscriptionColumns} data={subscriptionsHistory} loading={loading} />
                </div>

                <div className="row m-0 p-3">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                        <h5 className="fw-bold text-primary-c m-0"><Lang>Insurance historic</Lang></h5>
                        <ButtonBlue label={"Add new"} handleClick={() => setShowInsAddModal(true)} type={"button"} />
                    </div>
                    <CustomDataTable columns={insuranceColumns} data={insurancesHistory} loading={loading} />
                </div>
            </div>

            {openCalendar && (
                <DateRangeModal
                    state={selectionRange}
                    handleSubmit={handleSubmitRange}
                    handleClose={() => setOpenCalendar(false)}
                    handleChange={item => setSelectionRange([item.selection])}
                />
            )}
            {showCustomerEditModal && (
                <CustomerEditModal
                    handleClose={() => setShowCustomerEditModal(false)}
                    editedCustomerId={id}
                    onCustomerEdited={fetchDetails}
                />
            )}
            {showSubAddModal && (
                <SubscriptionAddModal
                    handleClose={() => setShowSubAddModal(false)}
                    onSubscriptionAdded={fetchDetails}
                    preselectedCustomer={customerData}
                />
            )}
            {showSubEditModal && (
                <SubscriptionEditModal
                    handleClose={() => setShowSubEditModal(false)}
                    onSubscriptionEdited={fetchDetails}
                    editedSubscriptionId={selectedId}
                />
            )}
            {showInsAddModal && (
                <InsuranceAddModal
                    handleClose={() => setShowInsAddModal(false)}
                    onInsuranceAdded={fetchDetails}
                    preselectedCustomer={customerData}
                />
            )}
            {showInsEditModal && (
                <InsuranceEditModal
                    handleClose={() => setShowInsEditModal(false)}
                    onInsuranceEdited={fetchDetails}
                    editedInsuranceId={selectedId}
                />
            )}
        </>
    );
}
