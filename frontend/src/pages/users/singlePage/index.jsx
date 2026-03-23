import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getImageURL } from "../../../api/api";
import { useAppAction, useAppState } from "../../../context/context";
import { Lang } from "../../../assets/js/lang";
import { FilterDate } from "../../../components/FilterDate";
import { DateRangeModal } from "../../../components/DateRangeModal";
import { CustomDataTable } from "../../../components/CustomDataTable";
import { Spinner } from "../../../components/Spinner";
import { format } from "date-fns";
import { FaEdit } from "react-icons/fa";
import { EditModal } from "../components/EditModal";
import "../../../assets/css/pages.css";
import { CustomLoader } from "../../../components/CustomLoader";

export function SingleUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const appState = useAppState();
    const appAction = useAppAction();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        totalSubscriptions: 0,
        totalInsurances: 0,
        countSubscriptions: 0,
    });
    const [subscriptions, setSubscriptions] = useState([]);
    const [insurances, setInsurances] = useState([]);

    const [filter, setFilter] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);

    const [showEditModal, setShowEditModal] = useState(false);

    const subscriptionColumns = [
        { name: '#', selector: (row, index) => index + 1, width: '50px' },
        { name: 'Plan', selector: row => row.plan?.description || 'N/A' },
        { name: 'Customer', selector: row => row.customer?.name || 'N/A' },
        { name: 'Duration', selector: row => (row.duration || 0) + " mois" },
        { name: 'Total (DH)', selector: row => row.price },
        { name: 'Start at', selector: row => row.start_at ? format(new Date(row.start_at), "dd/MM/yyyy") : 'N/A' },
        { name: 'Expire at', selector: row => row.expire_at ? format(new Date(row.expire_at), "dd/MM/yyyy") : 'N/A' }
    ];

    const insuranceColumns = [
        { name: '#', selector: (row, index) => index + 1, width: '50px' },
        { name: 'Price (DH)', selector: row => row.price },
        { name: 'Customer', selector: row => row.customer?.name || 'N/A' },
        { name: 'Duration', selector: row => appState.settings?.insurance.periode + " Months" || "N/A" },
        { name: 'Start at', selector: row => row.start_at ? format(new Date(row.start_at), "dd/MM/yyyy") : 'N/A' },
        { name: 'Expire at', selector: row => row.expire_at ? format(new Date(row.expire_at), "dd/MM/yyyy") : 'N/A' }
    ];

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await api({
                method: "get",
                url: `/users/details/${id}`,
                params: { filter, startDate, endDate }
            });
            if (res.data && res.data.data) {
                setUserData(res.data.data.user);
                setStats(res.data.data.stats);
                setSubscriptions(res.data.data.subscriptions);
                setInsurances(res.data.data.insurances);
            }
        } catch (err) {
            appAction({ type: "SET_ERROR", payload: err?.response?.data?.message || "Failed to fetch user details" });
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

    if (loading && !userData) return <div className="text-center p-5"><CustomLoader /></div>;
    if (!userData) return <div className="text-center p-5">User not found</div>;

    const isSelf = appState.currentUser?.id == userData.id;

    return (
        <>
            <div className="container-fluid p-0 page single-user-page">
                <div className="row header-page p-0 m-2">
                    <div className="col-6">
                        <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>User</Lang></div>
                    </div>
                    <div className="col-6 text-end">
                        <FilterDate onChange={handleFilter} filter={filter} />
                    </div>
                </div>

                <div className="row m-0 p-2">
                    <div className="col-md-9 p-2">
                        <div className="card h-100 border-0 shadow-sm p-4">
                            <div className="d-flex justify-content-between border-primary-c align-items-center p-0 border-bottom mb-3 pb-2">
                                <h4 className="fw-bold text-primary-c m-0"><Lang>Personal informations</Lang></h4>
                                <button className="btn btn-link text-primary-c  p-0" onClick={() => setShowEditModal(true)}>
                                    <FaEdit size={24} />
                                </button>
                            </div>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-4 col-sm-12 p-3 ">
                                        <div className="profile-img-container text-center">
                                            <img
                                                src={getImageURL(userData.picture || "defaultProfile.jpg")}
                                                alt={userData.name}
                                                className="rounded-circle "
                                                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8 col-sm-12 ">
                                        <div className="flex-grow-1">
                                            <div className="row">
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>Name</Lang>:</span>
                                                    <span className="text-muted">{userData.name}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>Username</Lang>:</span>
                                                    <span className="text-muted">{userData.username}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>CIN</Lang>:</span>
                                                    <span className="text-muted">{userData.cin || 'N/A'}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>Sexe</Lang>:</span>
                                                    <span className="text-muted">{userData.sexe}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>Phone</Lang>:</span>
                                                    <span className="text-muted">{userData.phone || 'N/A'}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>Role</Lang>:</span>
                                                    <span className="text-muted">{userData.role?.title || 'N/A'}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>Email</Lang>:</span>
                                                    <span className="text-muted">{userData.email}</span>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <span className="fw-bold text-primary-c me-2"><Lang>State</Lang>:</span>
                                                    <span className={userData.active ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                        {userData.active ? <Lang>Active</Lang> : <Lang>Inactive</Lang>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 p-2">
                        <div className="stats-container d-flex flex-column gap-3 h-100">
                            <div className="card border-0 shadow-sm p-3 text-center flex-grow-1 d-flex flex-column justify-content-center">
                                <div className="text-primary-c fw-bold mb-2"><Lang>Total Subscriptions</Lang></div>
                                <div className="h4 fw-bold m-0 text-dark">{stats.totalSubscriptions} <small className="text-muted">(DH)</small></div>
                            </div>
                            <div className="card border-0 shadow-sm p-3 text-center flex-grow-1 d-flex flex-column justify-content-center">
                                <div className="text-primary-c fw-bold mb-2"><Lang>Total Insurances</Lang></div>
                                <div className="h4 fw-bold m-0 text-dark">{stats.totalInsurances} <small className="text-muted">(DH)</small></div>
                            </div>
                            <div className="card border-0 shadow-sm p-3 text-center flex-grow-1 d-flex flex-column justify-content-center">
                                <div className="text-primary-c fw-bold mb-2"><Lang>Number of Subscription</Lang></div>
                                <div className="h4 fw-bold m-0 text-dark">{stats.countSubscriptions}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row m-0 p-3">
                    <h5 className="fw-bold text-primary-c mb-3 border-bottom pb-2"><Lang>Subscriptions</Lang></h5>
                    <CustomDataTable columns={subscriptionColumns} data={subscriptions} loading={loading} />
                </div>

                <div className="row m-0 p-3">
                    <h5 className="fw-bold text-primary-c mb-3 border-bottom pb-2"><Lang>Insurances</Lang></h5>
                    <CustomDataTable columns={insuranceColumns} data={insurances} loading={loading} />
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
            {showEditModal && (
                <EditModal
                    handleClose={() => setShowEditModal(false)}
                    editedUser={id}
                    onUserEdited={fetchDetails}
                />
            )}
        </>
    );
}