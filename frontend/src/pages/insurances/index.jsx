import { useState, useEffect, useRef } from "react";
import { ButtonBlue } from "../../components/ButtonBlue";
import { FilterSelectPrimary } from "../../components/FilterSelectPrimary";
import { useAppAction, useAppState } from "../../context/context";
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
import { safeFormatDate } from "../../utils/dateFormat";

export function Insurances() {
    const appState = useAppState();
    const appAction = useAppAction();
    const checkFirstRender = useRef(true);

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
            name: <Lang>Started at</Lang>,
            selector: row => safeFormatDate(row.start_at),
            sortable: true,
        },
        {
            name: <Lang>Expired at</Lang>,
            selector: row => safeFormatDate(row.expire_at),
            sortable: true,
        },
        {
            name: <Lang>Payed at</Lang>,
            selector: row => safeFormatDate(row.created_at),
            sortable: true,
        },
        {
            name: <Lang>Price</Lang>,
            selector: row => row.price,
            sortable: true,
        },
        {
            name: <Lang>State</Lang>,
            selector: row => row.state,
            cell: row => {
                let colorClass = 'text-success-c';
                if (row.state === 'Disactive') colorClass = 'text-danger-c';
                else if (row.state === 'Upcoming') colorClass = 'text-danger-c';
                else if (row.state === 'Pre-expire') colorClass = 'text-warning-c';
                return <span className={colorClass}>{<Lang>{row.state}</Lang>}</span>;
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

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState(null);
    const [editedInsuranceId, setEditedInsuranceId] = useState(null);

    const [filter, setFilter] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);

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
        const insurance = data.find(i => i.id == id);

        if (action === "view") {
            setSelectedInsurance(insurance);
            setShowViewModal(true);
        } else if (action === "edit") {
            setEditedInsuranceId(id);
            setShowEditModal(true);
        } else if (action === "remove") {
            if (window.confirm(appState.langData["Are you sure you want to remove this insurance?"] || "Are you sure you want to remove this insurance?")) {
                setLoading(true);
                api.delete(`/insurances/${id}`)
                    .then(() => {
                        appAction({ type: "SET_SUCCESS", payload: <Lang>Insurance removed successfully</Lang> });
                        fetchInsurances();
                    })
                    .catch(error => {
                        appAction({ type: "SET_ERROR", payload: error?.response?.data?.message || <Lang>Failed to remove insurance</Lang> });
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

    const fetchInsurances = async () => {
        try {
            setLoading(true);
            const response = await api.get('/insurances', {
                params: {
                    filter: filter,
                    startDate: startDate,
                    endDate: endDate
                }
            });
            if (response.data && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch insurances:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsurances();
    }, []);

    useEffect(() => {
        if (checkFirstRender.current) {
            checkFirstRender.current = false;
            return;
        }
        fetchInsurances();
    }, [filter, startDate, endDate]);

    return (
        <div className="container-fluid page">
            <div className="row header-page p-0 m-2">
                <div className="col-12 col-sm-12 col-md-6 p-0">
                    <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Assurances</Lang></div>
                </div>
                <div className="col-12 col-sm-12 col-md-6 p-0 text-end d-flex justify-content-end align-items-end">
                    <div className="d-inline-block p-2">
                        <FilterDate onChange={handleFilter} filter={filter} />
                    </div>
                    <div className="d-inline-block p-2 pe-0 ">
                        <ButtonBlue label={<Lang>Add New</Lang>} handleClick={handleAddNew} type={"button"} />
                    </div>
                </div>
            </div>
            <div className="row body-page p-2 m-0">
                <CustomDataTable columns={columns} data={data} loading={loading} />
            </div>
            {openCalendar && <DateRangeModal state={selectionRange} handleSubmit={handleSubmitRange} handleClose={handleCloseRangeModal} handleChange={item => setSelectionRange([item.selection])} />}
            {showAddModal && <AddModal handleClose={() => setShowAddModal(false)} onInsuranceAdded={fetchInsurances} />}
            {showViewModal && <ViewModal handleClose={() => setShowViewModal(false)} insurance={selectedInsurance} />}
            {showEditModal && <EditModal handleClose={() => setShowEditModal(false)} editedInsuranceId={editedInsuranceId} onInsuranceEdited={fetchInsurances} />}
        </div>
    );
}
