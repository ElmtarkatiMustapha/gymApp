import { useState, useEffect, useRef } from "react";
import { ButtonBlue } from "../../components/ButtonBlue";
import { FilterSelectPrimary } from "../../components/FilterSelectPrimary";
import { useAppAction, useAppState } from "../../context/context";
import { Lang } from "../../assets/js/lang";
import { SelectAction } from "../../components/SelectAction";
import api, { getImageURL } from "../../api/api";
import { CustomDataTable } from "../../components/CustomDataTable";
import { Picture } from "../../components/Picture";
import { FilterDate } from "../../components/FilterDate";
import { DateRangeModal } from "../../components/DateRangeModal";
import { format } from "date-fns";
import { AddModal } from "./components/AddModal";
import { useNavigate } from "react-router-dom";
import { EditModal } from "./components/EditModal";

export function Users() {
    const columns = [
        {
            name: <Lang>Profile</Lang>,
            cell: row => (
                <Picture picture={row.picture ? row.picture : "defaultProfile.jpg"} />
            ),
            width: '80px',
            sortable: false,
        },
        {
            name: <Lang>Name</Lang>,
            selector: row => row.name,
            sortable: true,
        },
        {
            name: <Lang>Role</Lang>,
            selector: row => row.role || 'N/A',
            sortable: true,
        },
        {
            name: <Lang>Username</Lang>,
            selector: row => row.username,
            sortable: true,
        },
        {
            name: <Lang>Email</Lang>,
            selector: row => row.email,
            sortable: true,
        },
        {
            name: <Lang>Sexe</Lang>,
            selector: row => <Lang>{row.sexe}</Lang>,
            sortable: true,
        },
        {
            name: <Lang>Total</Lang>,
            selector: row => row.total + row.totalInsurance || 0,
            sortable: true,
        },
        {
            name: <Lang>Actions</Lang>,
            cell: row => <SelectAction options={appState.selectData} id={row.id} onChange={handleActions} />,
            sortable: false
        },
    ];

    const [data, setData] = useState([]);
    const [reload, setReload] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editedUser, setEditedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const appState = useAppState();
    const appAction = useAppAction();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const checkFirstRender = useRef(true)
    const [filter, setFilter] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }])
    const handleFilter = (e) => {
        if (e.target.value === "range") {
            setOpenCalendar(true);
        } else {
            setFilter(e.target.value)
        }
    }
    const handleActions = (e) => {
        let id = e.target.getAttribute("data-id")
        switch (e.target.value) {
            case "view":
                navigate("/users/" + id)
                break;
            case "remove":
                if (window.confirm(appState.langData["Are you sure you want to remove this user?"] || "Are you sure you want to remove this user?")) {
                    setLoading(true)
                    // handle remove
                    api({
                        method: "delete",
                        url: "/users/" + id,
                        withCredentials: true
                    }).then(res => {
                        //handle response success
                        appAction({
                            type: "SET_SUCCESS",
                            payload: "User removed successfully"
                        });
                        setReload(reload + 1)
                        setLoading(false)
                    }).catch(err => {
                        //handle error
                        appAction({
                            type: "SET_ERROR",
                            payload: err?.response?.data?.message || "Failed to remove user"
                        })
                        setLoading(false)
                        e.target.value = "default"
                    })
                } else {
                    e.target.value = "default"
                }
                break;
            case "edit":
                setEditedUser(id);
                setShowEditModal(true);
                e.target.value = "default"
                break;
            default:
                break;
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

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // const response = await api.get('/users');
            // if (response.data && response.data.data) {
            //     setData(response.data.data);
            // }
            const response = await api({
                method: "get",
                url: "/users",
                params: {
                    filter: filter,
                    startDate: startDate,
                    endDate: endDate
                },
            })
            if (response.data && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        try {
            if (checkFirstRender.current) {
                checkFirstRender.current = false;
                return;
            }
            (async () => {
                setLoading(true);
                // const response = await api.get('/users');
                // if (response.data && response.data.data) {
                //     setData(response.data.data);
                // }
                const response = await api({
                    method: "get",
                    url: "/users",
                    params: {
                        filter: filter,
                        startDate: startDate,
                        endDate: endDate
                    },
                })
                if (response.data && response.data.data) {
                    setData(response.data.data);
                }
                setLoading(false)
            })()
        } catch (err) {
            appAction({
                type: "SET_ERROR",
                payload: err?.response?.data?.message
            })
            setLoading(false)
        }

    }, [filter, reload, startDate, endDate])
    const onUserAdded = () => {
        setReload(reload + 1)
    };
    const onUserEdited = () => {
        setReload(reload + 1)
    };
    return (
        <>
            <div className="container-fluid page">
                <div className="row header-page p-0 m-2">
                    <div className="col-12 col-sm-12 col-md-6 p-0">
                        <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Users</Lang></div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-6 p-0 text-end d-flex justify-content-end align-items-end">
                        <div className="d-inline-block p-2">
                            {/* <FilterSelectPrimary options={appState.selectData} defTitle="Filter By" /> */}
                            <FilterDate onChange={handleFilter} filter={filter} />
                        </div>
                        <div className="d-inline-block p-2 pe-0 ">
                            <ButtonBlue label="Add New" handleClick={() => setShowModal(true)} type={"button"} />
                        </div>
                    </div>
                </div>
                <div className="row body-page p-2 m-0">
                    <CustomDataTable columns={columns} data={data} loading={loading} />
                </div>
            </div>
            {showModal && <AddModal handleClose={() => setShowModal(false)} onUserAdded={onUserAdded} />}
            {showEditModal && <EditModal handleClose={() => setShowEditModal(false)} editedUser={editedUser} onUserEdited={onUserEdited} />}
            {openCalendar && <DateRangeModal state={selectionRange} handleSubmit={handleSubmitRange} handleClose={handleCloseRangeModal} handleChange={item => setSelectionRange([item.selection])} />}
        </>
    )
}
