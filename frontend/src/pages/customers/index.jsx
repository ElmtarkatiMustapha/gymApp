import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAppAction, useAppState } from "../../context/context";
import { EditModal } from "./components/EditModal";
import { useEffect, useState } from "react";

import { StatisticBox } from "../../components/StatisticBox";
import { FilterSelectPrimary } from "../../components/FilterSelectPrimary";
import { FilterDate } from "../../components/FilterDate";
import { SelectAction } from "../../components/SelectAction";
import { useRef } from "react";
import { Lang } from "../../assets/js/lang";
import { ButtonBlue } from "../../components/ButtonBlue";
import api from "../../api/api";
import { safeFormatDate } from "../../utils/dateFormat";
import { CustomDataTable } from "../../components/CustomDataTable";
import { AddModal } from "./components/AddModal";
import { DateRangeModal } from "../../components/DateRangeModal";
import { printCustomerFile } from "../../utils/printCustomerFile";

export function Customers() {
    // Example columns for DataTable
    const columns = [
        {
            name: <Lang>ID</Lang>,
            selector: row => row.id,
            sortable: true,
            width: '80px',
        },
        {
            name: <Lang>Name</Lang>,
            selector: row => row.name,
            sortable: true,
        },
        {
            name: <Lang>CIN</Lang>,
            selector: row => row.cin,
            sortable: true,
        },
        {
            name: <Lang>Phone</Lang>,
            selector: row => row.phone,
            sortable: true,
        },
        {
            name: <Lang>Email</Lang>,
            selector: row => row.email,
        },
        {
            name: <Lang>Sexe</Lang>,
            selector: row => <Lang>{row.sexe}</Lang>,
            sortable: true,
        },
        {
            name: <Lang>Birthday</Lang>,
            selector: row => safeFormatDate(row.birthday),
            sortable: true,
        },
        {
            name: <Lang>Insurance</Lang>,
            selector: row => row.insurance,
            cell: row => (
                <span className={row.insurance === 'Active' ? 'text-success-c' : 'text-danger-c'}>
                    <Lang>{row.insurance}</Lang>
                </span>
            ),
            sortable: true,
        },
        {
            name: <Lang>State</Lang>,
            selector: row => row.state,
            cell: row => (
                <span className={row.state === 'Active' ? 'text-success-c' : 'text-danger-c'}>
                    <Lang>{row.state}</Lang>
                </span>
            ),
            sortable: true,
        },
        {
            name: <Lang>Current Plan</Lang>,
            selector: row => row.plan.name,
            cell: row => (
                <div className="d-flex flex-column">
                    <Lang>{row.plan.name}</Lang>
                    {row.plan.status !== 'Active' && row.plan.status !== 'None' && (
                        <small className={row.plan.status === 'Upcoming' || row.plan.status === 'Expired' ? 'text-danger-c' : 'text-warning-c'}>
                            <Lang>{row.plan.status}</Lang>
                        </small>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: <Lang>Expired at</Lang>,
            selector: row => row.plan.expired_at,
            sortable: true,
        },
        {
            name: <Lang>Notice Times</Lang>,
            selector: row => row.notice_times,
            sortable: true,
        },
        {
            name: Lang({ children: "Actions" }),
            cell: row => {
                const rowActions = [...appState.selectData];
                // Add Notice action if not already there (though we should update context instead, but this is a quick fix for this page)
                if (!rowActions.find(a => a.value === 'notice')) {
                    rowActions.push({ value: 'notice', name: 'Notice' });
                }
                if (!rowActions.find(a => a.value === 'print')) {
                    rowActions.push({ value: 'print', name: 'Print File' });
                }
                return <SelectAction options={rowActions} id={row.id} onChange={handleAction} />;
            },
            sortable: false
        },
    ];

    const optionFilterSexe = [
        { value: "male", name: "male" },
        { value: "female", name: "female" },
    ]

    // Removed dummy data

    // Example loading state
    const navigate = useNavigate();
    const appAction = useAppAction();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedCustomerId, setEditedCustomerId] = useState(null);
    const [data, setData] = useState({ items: [], activeCustomers: 0, disactiveCustomers: 0 });
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const appState = useAppState()
    const checkFirstRender = useRef(true)
    const [filter, setFilter] = useState("all");
    const [filterSexe, setFilterSexe] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }])
    const [search, setSearch] = useState("");
    const searchTimeoutRef = useRef(null);
    const handleFilterSexe = (e) => {
        setFilterSexe(e.target.value)
    }
    const handleFilter = (e) => {
        if (e.target.value === "range") {
            setOpenCalendar(true);
        } else {
            setFilter(e.target.value)
        }
    }
    const handleSubmitRange = (e) => {
        e.preventDefault()
        setStartDate(format(selectionRange[0].startDate, "Y-MM-dd"));
        setEndDate(format(selectionRange[0].endDate, "Y-MM-dd"));
        setFilter("range");
        handleCloseRangeModal();
    }

    //close date model
    const handleCloseRangeModal = () => {
        setOpenCalendar(false);
    }



    const handleAction = (e) => {
        const action = e.target.value;
        const id = e.target.getAttribute("data-id");

        if (action === "view") {
            navigate(`/customers/${id}`);
        } else if (action === "edit") {
            setEditedCustomerId(id);
            setShowEditModal(true);
        } else if (action === "remove") {
            if (window.confirm(appState.langData["Are you sure you want to remove this customer?"] || "Are you sure you want to remove this customer?")) {
                setLoading(true);
                api.delete(`/customers/${id}`)
                    .then(() => {
                        appAction({ type: "SET_SUCCESS", payload: "Customer removed successfully" });
                        fetchCustomers();
                    })
                    .catch(error => {
                        appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || "Failed to remove customer" });
                        setLoading(false);
                    });
            }
        } else if (action === "notice") {
            setLoading(true);
            api.post(`/customers/notify/${id}`)
                .then(() => {
                    appAction({ type: "SET_SUCCESS", payload: "Notification sent successfully" });
                    fetchCustomers();
                })
                .catch(error => {
                    appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || "Failed to send notification" });
                    setLoading(false);
                });
        } else if (action === "print") {
            setLoading(true);
            api({ method: "get", url: `/customers/details/${id}` })
                .then((res) => {
                    if (res.data && res.data.data) {
                        const d = res.data.data;
                        printCustomerFile({
                            customerData: d.customer,
                            activePlan: d.active_plan,
                            subscriptionsHistory: d.subscriptions_history,
                            insurancesHistory: d.insurances_history,
                            settings: appState.settings,
                            langData: appState.langData,
                            currentLang: appState.currentLang,
                        });
                    }
                })
                .catch((error) => {
                    appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || "Failed to load customer details" });
                })
                .finally(() => setLoading(false));
        }
        e.target.value = "default";
    }

    const handleBulkAction = (e) => {
        const action = e.target.value;
        const currentParams = {
            filter: filter,
            filterSexe: filterSexe,
            startDate: startDate,
            endDate: endDate
        };

        if (action === "add") {
            setShowModal(true);
        } else if (action === "pre_expire") {
            if (window.confirm("Send notifications to all customers nearing expiration?")) {
                setLoading(true);
                api.post("/customers/notify/pre-expire", null, { params: currentParams })
                    .then(() => {
                        appAction({ type: "SET_SUCCESS", payload: "Pre-expire notifications sent successfully" });
                        fetchCustomers();
                    })
                    .catch(error => {
                        appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || "Failed to send notifications" });
                        setLoading(false);
                    });
            }
        } else if (action === "expired") {
            if (window.confirm("Send notifications to all customers with expired plans?")) {
                setLoading(true);
                api({
                    method: "post",
                    url: "/customers/notify/expired",
                    params: currentParams
                }).then(() => {
                    appAction({ type: "SET_SUCCESS", payload: "Expired notifications sent successfully" });
                    fetchCustomers();
                })
                    .catch(error => {
                        appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || "Failed to send notifications" });
                        setLoading(false);
                    });
            }
        }
        e.target.value = "all";
    }

    const handleAddNew = () => {
        setShowModal(true)
    }

    const handleCustomerAdded = (newCustomer) => {
        setData(prev => ({
            ...prev,
            items: [newCustomer, ...(Array.isArray(prev.items) ? prev.items : [])],
            activeCustomers: (prev.activeCustomers || 0) + (newCustomer.state == "Active" ? 1 : 0),
            disactiveCustomers: (prev.disactiveCustomers || 0) + (newCustomer.state == "Inactive" ? 1 : 0)
        }));
    }

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api({
                method: "get",
                url: "/customers",
                params: {
                    filter: filter,
                    filterSexe: filterSexe,
                    startDate: startDate,
                    endDate: endDate,
                    search: search || undefined
                },
            })
            if (response.data && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCustomers();
    }, []);
    useEffect(() => {
        if (checkFirstRender.current) {
            checkFirstRender.current = false;
            return;
        }
        fetchCustomers();

    }, [filter, filterSexe, startDate, endDate])

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchCustomers();
        }, 400);
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    return (
        <>
            <div className="container-fluid page">
                <div className="row header-page p-0 m-2">
                    <div className="col-12 col-sm-6 p-0 d-flex align-items-end">
                        <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Customers</Lang></div>
                    </div>
                    <div className="col-12 col-sm-6 p-0 text-end d-flex justify-content-start justify-content-sm-end align-items-end flex-wrap">
                        <div className="d-inline-block p-2 pe-0">
                            <select onChange={handleBulkAction} className="form-select pt-1 pb-1 filter-select-primary w-auto" defaultValue="all">
                                <option value="all" disabled><Lang>Actions</Lang></option>
                                <option value="add"><Lang>Add New</Lang></option>
                                <option value="pre_expire"><Lang>Notice Pre-expire</Lang></option>
                                <option value="expired"><Lang>Notice Expired</Lang></option>
                            </select>
                        </div>
                        <div className="d-inline-block p-2">
                            <FilterSelectPrimary options={optionFilterSexe} onChange={handleFilterSexe} defTitle="All" defaultValue="all" defaultOption="all" />
                        </div>
                        <div className="d-inline-block p-2">
                            <FilterDate onChange={handleFilter} filter={filter} />
                        </div>
                    </div>
                </div>
                
                <div className="row statistics m-0">
                    <div className="col-12 col-sm-12 col-md-3 p-2">
                        <StatisticBox label={<Lang>Total Of Customers</Lang>} value={data?.activeCustomers + data?.disactiveCustomers} color={"primary-c"} />
                    </div>
                    <div className="col-12 col-sm-12 col-md-3 p-2">
                        <StatisticBox label={<Lang>Active Customers</Lang>} value={data?.activeCustomers} color={"success-c"} />
                    </div>
                    <div className="col-12 col-sm-12 col-md-3 p-2">
                        <StatisticBox label={<Lang>Inactive Customers</Lang>} value={data?.disactiveCustomers} color={"danger-c"} />
                    </div>
                </div>
                <div className="row m-2 mt-0">
                    <div className="col-12 col-sm-6 offset-sm-6 p-0 text-end">
                        <div className="p-2 pe-0">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={appState.langData["Search by Name, CIN or ID"] || "Search by Name, CIN or ID"}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="row body-page p-2 m-0">
                    <CustomDataTable columns={columns} data={data?.items} loading={loading} />
                </div>
            </div>
            {openCalendar && <DateRangeModal state={selectionRange} handleSubmit={handleSubmitRange} handleClose={handleCloseRangeModal} handleChange={item => setSelectionRange([item.selection])} />}
            {showModal && <AddModal handleClose={() => setShowModal(false)} onCustomerAdded={handleCustomerAdded} />}
            {showEditModal && <EditModal handleClose={() => setShowEditModal(false)} editedCustomerId={editedCustomerId} onCustomerEdited={fetchCustomers} />}
        </>
    )
}