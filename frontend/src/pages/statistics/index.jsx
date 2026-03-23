import { useState, useEffect } from "react";
import { FilterDate } from "../../components/FilterDate";
import api from "../../api/api";
import { CustomLoader } from "../../components/CustomLoader";
import { DateRangeModal } from "../../components/DateRangeModal";
import { format } from "date-fns";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Lang } from "../../assets/js/lang";
import { useAppState } from "../../context/context";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const chartCardStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    padding: "20px",
    height: "100%",
};

export function Statistics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const appState = useAppState();
    const [filter, setFilter] = useState("all");
    const [startDate, setStartDate] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectionRange, setSelectionRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await api.get("/statistics", {
                params: {
                    filter,
                    startDate: startDate !== 0 ? startDate : undefined,
                    endDate: endDate !== 0 ? endDate : undefined
                }
            });
            if (response.data && response.data.data) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [filter, startDate, endDate]);

    const handleFilter = (e) => {
        if (e.target.value === "range") {
            setOpenCalendar(true);
        } else {
            setFilter(e.target.value);
        }
    };

    const handleCloseRangeModal = () => setOpenCalendar(false);

    const handleSubmitRange = (e) => {
        e.preventDefault();
        setStartDate(format(selectionRange[0].startDate, "yyyy-MM-dd"));
        setEndDate(format(selectionRange[0].endDate, "yyyy-MM-dd"));
        setFilter("range");
        handleCloseRangeModal();
    };

    const getFilterLabel = () => {
        if (filter === 'range') return `${startDate} to ${endDate}`;
        return filter.charAt(0).toUpperCase() + filter.slice(1);
    };

    if (loading && !stats) {
        return (
            <div className="container-fluid page">
                <CustomLoader />
            </div>
        );
    }

    // Build chart labels from turnover dates
    const turnoverLabels = stats?.turnover?.chart?.map((d) => d.date?.substring(5) || "") || [];
    const turnoverData = stats?.turnover?.chart?.map((d) => d.total) || [];

    // Build new customers data by gender
    const ncLabels = [...new Set(stats?.newCustomers?.chart?.map((d) => d.date?.substring(5)) || [])];
    const ncMen = ncLabels.map((date) => {
        const found = stats?.newCustomers?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "male");
        return found ? found.count : 0;
    });
    const ncWomen = ncLabels.map((date) => {
        const found = stats?.newCustomers?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "female");
        return found ? found.count : 0;
    });

    // Build subscriptions weekly data by gender
    const subLabels = [...new Set(stats?.subscriptions?.chart?.map((d) => d.date?.substring(5)) || [])];
    const subMen = subLabels.map((date) => {
        const found = stats?.subscriptions?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "male");
        return found ? found.count : 0;
    });
    const subWomen = subLabels.map((date) => {
        const found = stats?.subscriptions?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "female");
        return found ? found.count : 0;
    });

    // Build subscriptions per state (pie)
    const stateData = stats?.subscriptionsPerState || { Active: 0, "Pre-expire": 0, Expired: 0 };

    // Build subscriptions per plan (bar)
    const planNames = [...new Set(stats?.subscriptionsPerPlan?.map((d) => d.plan_name) || [])];
    const planMen = planNames.map((name) => {
        const found = stats?.subscriptionsPerPlan?.find((d) => d.plan_name === name && d.sexe?.toLowerCase() === "male");
        return found ? found.count : 0;
    });
    const planWomen = planNames.map((name) => {
        const found = stats?.subscriptionsPerPlan?.find((d) => d.plan_name === name && d.sexe?.toLowerCase() === "female");
        return found ? found.count : 0;
    });

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: true } },
    };

    return (
        <div className="container-fluid page">
            <div className="row header-page p-0 m-2">
                <div className="col-12 col-sm-12 col-md-6 p-0">
                    <div className="title h3 m-0 fw-semibold p-2 ps-0"><Lang>Statistics</Lang></div>
                </div>
                <div className="col-12 col-sm-12 col-md-6 p-0 text-end d-flex justify-content-end align-items-end">
                    <div className="d-inline-block p-2 pe-0">
                        <FilterDate onChange={handleFilter} filter={filter} />
                    </div>
                </div>
            </div>

            {loading ? <CustomLoader /> : (
                <>
                    {/* Row 1: Turnover, New Customers, Subscriptions */}
                    <div className="row m-0 p-2">
                        <div className="col-12 col-md-4 p-2">
                            <div style={chartCardStyle}>
                                <h6 className="fw-bold text-center"><Lang>Turnover</Lang></h6>
                                <p className="text-center text-muted" style={{ fontSize: "0.8rem" }}><Lang>For</Lang>: {getFilterLabel()}</p>
                                <div style={{ height: "200px" }}>
                                    <Line
                                        data={{
                                            labels: turnoverLabels,
                                            datasets: [{
                                                label: appState.langData["Revenue"] || "Revenue",
                                                data: turnoverData,
                                                borderColor: "#f0920a",
                                                backgroundColor: "rgba(240, 146, 10, 0.1)",
                                                tension: 0.4,
                                                fill: true,
                                            }],
                                        }}
                                        options={{ ...lineOptions, plugins: { legend: { display: false } } }}
                                    />
                                </div>
                                <div className="text-end mt-2">
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "#1a3a4a", color: "#fff" }}>
                                        {stats?.turnover?.total || 0} dh
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 p-2">
                            <div style={chartCardStyle}>
                                <h6 className="fw-bold text-center"><Lang>New Customers</Lang></h6>
                                <p className="text-center text-muted" style={{ fontSize: "0.8rem" }}><Lang>For</Lang>: {getFilterLabel()}</p>
                                <div style={{ height: "200px" }}>
                                    <Line
                                        data={{
                                            labels: ncLabels,
                                            datasets: [
                                                { label: appState.langData["Men"] || "Men", data: ncMen, borderColor: "#1a3a4a", tension: 0.4 },
                                                { label: appState.langData["Women"] || "Women", data: ncWomen, borderColor: "#f0920a", tension: 0.4 },
                                            ],
                                        }}
                                        options={lineOptions}
                                    />
                                </div>
                                <div className="text-end mt-2">
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "#1a3a4a", color: "#fff" }}>
                                        {stats?.newCustomers?.total || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 p-2">
                            <div style={chartCardStyle}>
                                <h6 className="fw-bold text-center"><Lang>Subscriptions</Lang></h6>
                                <p className="text-center text-muted" style={{ fontSize: "0.8rem" }}><Lang>For</Lang>: {getFilterLabel()}</p>
                                <div style={{ height: "200px" }}>
                                    <Line
                                        data={{
                                            labels: subLabels,
                                            datasets: [
                                                { label: appState.langData["Men"] || "Men", data: subMen, borderColor: "#1a3a4a", tension: 0.4 },
                                                { label: appState.langData["Women"] || "Women", data: subWomen, borderColor: "#f0920a", tension: 0.4 },
                                            ],
                                        }}
                                        options={lineOptions}
                                    />
                                </div>
                                <div className="text-end mt-2">
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "#1a3a4a", color: "#fff" }}>
                                        {stats?.subscriptions?.total || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Subscriptions Per State, Subscriptions Per Plan */}
                    <div className="row m-0 p-2">
                        <div className="col-12 col-md-5 p-2">
                            <div style={chartCardStyle}>
                                <h6 className="fw-bold text-center"><Lang>Subscriptions Per state</Lang></h6>
                                {/* <p className="text-center text-muted" style={{ fontSize: "0.8rem" }}>For: {getFilterLabel()}</p> */}
                                <div style={{ height: "250px", display: "flex", justifyContent: "center" }}>
                                    <Pie
                                        data={{
                                            labels: [
                                                appState.langData["Active"] || "Active",
                                                appState.langData["Pre-expire"] || "Pre-expire",
                                                appState.langData["Expired"] || "Expired",
                                                appState.langData["Upcoming"] || "Upcoming"
                                            ],
                                            datasets: [{
                                                data: [stateData.Active, stateData["Pre-expire"], stateData.Expired, stateData.Upcoming],
                                                backgroundColor: ["#4CAF50", "#FFC107", "#F44336", "#2196F3"],
                                                borderWidth: 1,
                                            }],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: "right",
                                                    labels: {
                                                        usePointStyle: true,
                                                        pointStyle: "line",
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-7 p-2">
                            <div style={chartCardStyle}>
                                <h6 className="fw-bold text-center"><Lang>Subscriptions Per Plan</Lang></h6>
                                {/* <p className="text-center text-muted" style={{ fontSize: "0.8rem" }}>For: {getFilterLabel()}</p> */}
                                <div style={{ height: "250px" }}>
                                    <Bar
                                        data={{
                                            labels: planNames,
                                            datasets: [
                                                {
                                                    label: appState.langData["Men"] || "Men",
                                                    data: planMen,
                                                    backgroundColor: "#1a3a4a",
                                                },
                                                {
                                                    label: appState.langData["Women"] || "Women",
                                                    data: planWomen,
                                                    backgroundColor: "#f0920a",
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: "top" } },
                                            scales: { y: { beginAtZero: true } },
                                        }}
                                    />
                                </div>
                                <div className="text-end mt-2">
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "#1a3a4a", color: "#fff" }}>
                                        {stats?.subscriptions?.total || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {openCalendar && (
                <DateRangeModal
                    state={selectionRange}
                    handleSubmit={handleSubmitRange}
                    handleClose={handleCloseRangeModal}
                    handleChange={(item) => setSelectionRange([item.selection])}
                />
            )}
        </div>
    );
}
