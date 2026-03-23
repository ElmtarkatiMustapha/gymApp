import { useState, useEffect, useRef } from "react";
import { ButtonBlue } from "../../components/ButtonBlue";
import { FilterSelectPrimary } from "../../components/FilterSelectPrimary";
import { StatisticBox } from "../../components/StatisticBox";
import { useAppAction, useAppState } from "../../context/context";
import { CustomLoader } from "../../components/CustomLoader";
import { Lang } from "../../assets/js/lang";
import { SelectAction } from "../../components/SelectAction";
import api from "../../api/api";
import { CustomDataTable } from "../../components/CustomDataTable";
import { FilterDate } from "../../components/FilterDate";
import { AddModal } from "./components/AddModal";
import { ViewModal } from "./components/ViewModal";
import { EditModal } from "./components/EditModal";
import { DateRangeModal } from "../../components/DateRangeModal";
import { format } from "date-fns";

export function Subscriptions() {
    const columns = [
        {
            name: <Lang>ID</Lang>,
            selector: row => row.id,
            sortable: true,
            width: '80px',
        },
        {
            name: <Lang>Customer</Lang>,
            selector: row => row.customer?.name || row.customer,
            sortable: true,
        },
        {
            name: <Lang>Plan</Lang>,
            selector: row => row.plan?.name || row.plan,
            sortable: true,
        },
        {
            name: <Lang>Price</Lang>,
            selector: row => row.price,
            sortable: true,
        },
        {
            name: <Lang>Started at</Lang>,
            selector: row => row.start_at,
            sortable: true,
        },
        {
            name: <Lang>Expired at</Lang>,
            selector: row => row.expire_at,
            sortable: true,
        },
        {
            name: <Lang>Sexe</Lang>,
            selector: row => <Lang>{row.customer?.sexe || row.sexe}</Lang>,
            sortable: true,
        },
        {
            name: <Lang>State</Lang>,
            selector: row => row.state,
            cell: row => {
                let colorClass = 'text-success-c';
                if (row.state === 'Expired' || row.state === 'Upcoming') colorClass = 'text-danger-c';
                else if (row.state === 'Pre-expire') colorClass = 'text-warning-c';
                return <span className={colorClass}><Lang>{row.state}</Lang></span>;
            },
            sortable: true,
        },
        {
            name: <Lang>Notice Times</Lang>,
            selector: row => row.notice_times,
            sortable: true,
        },
        {
            name: Lang({ children: "Actions" }),
            cell: row => <SelectAction options={appState.selectData} id={row.id} onChange={handleAction} />,
            sortable: false
        },
    ];
    const optionFilterSexe = [
        { value: "male", name: <Lang>male</Lang> },
        { value: "female", name: <Lang>female</Lang> },
    ]

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, preExpire: 0, expired: 0 });
    const appState = useAppState();
    const appAction = useAppAction();
    const checkFirstRender = useRef(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [editedSubscriptionId, setEditedSubscriptionId] = useState(null);

    const [filter, setFilter] = useState("all");
    const [filterSexe, setFilterSexe] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);

    const handleFilterSexe = (e) => setFilterSexe(e.target.value);
    const handleFilter = (e) => {
        if (e.target.value === "range") {
            setOpenCalendar(true);
        } else {
            setFilter(e.target.value);
        }
    };

    const handleAddNew = () => setShowAddModal(true);

    const handleAction = (e) => {
        const action = e.target.value;
        const id = e.target.getAttribute("data-id");
        const subscription = data.find(s => s.id == id);

        if (action === "view") {
            setSelectedSubscription(subscription);
            setShowViewModal(true);
        } else if (action === "edit") {
            setEditedSubscriptionId(id);
            setShowEditModal(true);
        } else if (action === "remove") {
            if (window.confirm(appState.langData["Are you sure you want to remove this subscription?"] || "Are you sure you want to remove this subscription?")) {
                setLoading(true);
                api.delete(`/subscriptions/${id}`)
                    .then(() => {
                        appAction({ type: "SET_SUCCESS", payload: <Lang>Subscription removed successfully</Lang> });
                        fetchSubscriptions();
                    })
                    .catch(error => {
                        appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || <Lang>Failed to remove subscription</Lang> });
                        setLoading(false);
                    });
            }
        }
        e.target.value = "default";
    };

    const handleCloseRangeModal = () => setOpenCalendar(false);
    const handleSubmitRange = (e) => {
        e.preventDefault();
        setStartDate(format(selectionRange[0].startDate, "yyyy-MM-dd"));
        setEndDate(format(selectionRange[0].endDate, "yyyy-MM-dd"));
        setFilter("range");
        handleCloseRangeModal();
    };

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/subscriptions', {
                params: { filter, filterSexe, startDate, endDate }
            });
            if (response.data && response.data.data) {
                setData(response.data.data);
                if (response.data.stats) setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    useEffect(() => {
        if (checkFirstRender.current) {
            checkFirstRender.current = false;
            return;
        }
        fetchSubscriptions();
    }, [filter, filterSexe, startDate, endDate]);

    return (
        <div className="container-fluid page">
            <div className="row header-page p-0 m-2">
                <div className="col-6 col-sm-6  col-md-4 p-0">
                    <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Subscriptions</Lang></div>
                </div>
                <div className="col-6 col-sm-6 col-md-3 p-0 text-end d-flex justify-content-end align-items-end">
                    <div className="d-inline-block p-2 pe-0 ">
                        <ButtonBlue label={<Lang>Add New</Lang>} handleClick={handleAddNew} type={"button"} />
                    </div>
                </div>
                <div className="col-12 col-sm-12 col-md-5 p-0 text-end d-flex justify-content-end align-items-end">
                    <div className="d-inline-block p-2">
                        <FilterSelectPrimary options={optionFilterSexe} onChange={handleFilterSexe} defTitle={<Lang>All</Lang>} defaultValue="all" defaultOption="all" />
                    </div>
                    <div className="d-inline-block p-2">
                        <FilterDate onChange={handleFilter} filter={filter} />
                    </div>

                </div>
            </div>
            <div className="row statistics m-0">
                <div className="col-12 col-sm-12 col-md-3 p-2">
                    <StatisticBox label={<Lang>Total of Subscriptions</Lang>} value={stats.total} color={"primary-c"} />
                </div>
                <div className="col-12 col-sm-12 col-md-3 p-2">
                    <StatisticBox label={<Lang>Pre-expire</Lang>} value={stats.preExpire} color={"warning-c"} />
                </div>
                <div className="col-12 col-sm-12 col-md-3 p-2">
                    <StatisticBox label={<Lang>Expired</Lang>} value={stats.expired} color={"danger-c"} />
                </div>
            </div>
            <div className="row body-page p-2 m-0">
                <CustomDataTable columns={columns} data={data} loading={loading} />
            </div>
            {openCalendar && <DateRangeModal state={selectionRange} handleSubmit={handleSubmitRange} handleClose={handleCloseRangeModal} handleChange={item => setSelectionRange([item.selection])} />}
            {showAddModal && <AddModal handleClose={() => setShowAddModal(false)} onSubscriptionAdded={fetchSubscriptions} />}
            {showViewModal && <ViewModal handleClose={() => setShowViewModal(false)} subscription={selectedSubscription} />}
            {showEditModal && <EditModal handleClose={() => setShowEditModal(false)} editedSubscriptionId={editedSubscriptionId} onSubscriptionEdited={fetchSubscriptions} />}
        </div>
    )
}
