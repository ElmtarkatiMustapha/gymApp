import { useState, useEffect } from "react";
import api from "../../api/api";
import { CustomLoader } from "../../components/CustomLoader";
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

const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #e8ecf0",
    padding: "20px",
    height: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const kpiCardStyle = (color) => ({
    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
    border: `1px solid ${color}30`,
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderLeft: `4px solid ${color}`,
});

export function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const appState = useAppState();

    const nowDate = new Date();
    const monthName = nowDate.toLocaleString("default", { month: "long", year: "numeric" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const statsRes = await api.get("/statistics", { params: { filter: "month" } });
            if (statsRes.data?.data) setStats(statsRes.data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !stats) {
        return (
            <div className="container-fluid page">
                <CustomLoader />
            </div>
        );
    }

    // Turnover chart
    const turnoverChart = Array.isArray(stats?.turnover?.chart) ? stats.turnover.chart : [];
    const turnoverLabels = turnoverChart.map((d) => d.date?.substring(5) || "");
    const turnoverData = turnoverChart.map((d) => d.total);

    // New customers chart
    const ncLabels = [...new Set(stats?.newCustomers?.chart?.map((d) => d.date?.substring(5)) || [])];
    const ncMen = ncLabels.map((date) => {
        const found = stats?.newCustomers?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "male");
        return found ? found.count : 0;
    });
    const ncWomen = ncLabels.map((date) => {
        const found = stats?.newCustomers?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "female");
        return found ? found.count : 0;
    });

    // Subscriptions chart
    const subLabels = [...new Set(stats?.subscriptions?.chart?.map((d) => d.date?.substring(5)) || [])];
    const subMen = subLabels.map((date) => {
        const found = stats?.subscriptions?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "male");
        return found ? found.count : 0;
    });
    const subWomen = subLabels.map((date) => {
        const found = stats?.subscriptions?.chart?.find((d) => (d.date?.substring(5) || d.date) === date && d.sexe?.toLowerCase() === "female");
        return found ? found.count : 0;
    });

    // State pie
    const stateData = stats?.subscriptionsPerState || { Active: 0, "Pre-expire": 0, Expired: 0, Upcoming: 0 };

    // Plan bar
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
            {/* Header */}
            <div className="row header-page p-0 m-2 align-items-center">
                <div className="col-12 p-0">
                    <div className="title h3 m-0 fw-semibold p-2 ps-0">
                        <Lang>Dashboard</Lang>
                    </div>
                    <small className="text-muted ps-2" style={{ fontSize: "0.85rem" }}>
                        📅 {monthName}
                    </small>
                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <>
                    {/* KPI Row */}
                    <div className="row m-0 p-2 g-3">
                        <div className="col-6 col-md-4 col-xl-2">
                            <div style={kpiCardStyle("#f0920a")}>
                                {/* <span style={{ fontSize: "1.6rem" }}>💰</span> */}
                                <div className="fw-bold" style={{ fontSize: "1.4rem", color: "#1a3a4a" }}>
                                    {stats?.turnover?.total || 0} <small style={{ fontSize: "0.8rem" }}>dh</small>
                                </div>
                                <small className="text-muted"><Lang>Turnover</Lang></small>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <div style={kpiCardStyle("#4CAF50")}>
                                {/* <span style={{ fontSize: "1.6rem" }}>👥</span> */}
                                <div className="fw-bold" style={{ fontSize: "1.4rem", color: "#1a3a4a" }}>
                                    {stats?.newCustomers?.total || 0}
                                </div>
                                <small className="text-muted"><Lang>New Customers</Lang></small>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <div style={kpiCardStyle("#2196F3")}>
                                {/* <span style={{ fontSize: "1.6rem" }}>📋</span> */}
                                <div className="fw-bold" style={{ fontSize: "1.4rem", color: "#1a3a4a" }}>
                                    {stats?.subscriptions?.total || 0}
                                </div>
                                <small className="text-muted"><Lang>Subscriptions</Lang></small>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <div style={kpiCardStyle("#9C27B0")}>
                                {/* <span style={{ fontSize: "1.6rem" }}>✅</span> */}
                                <div className="fw-bold" style={{ fontSize: "1.4rem", color: "#1a3a4a" }}>
                                    {stateData.Active || 0}
                                </div>
                                <small className="text-muted"><Lang>Active Subscribers</Lang></small>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <div style={kpiCardStyle("#00897B")}>
                                <div className="fw-bold" style={{ fontSize: "1.4rem", color: "#1a3a4a" }}>
                                    {stats?.payments?.received || 0} <small style={{ fontSize: "0.8rem" }}>dh</small>
                                </div>
                                <small className="text-muted"><Lang>Subscription payments</Lang></small>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-xl-2">
                            <div style={kpiCardStyle("#E53935")}>
                                <div className="fw-bold" style={{ fontSize: "1.4rem", color: "#1a3a4a" }}>
                                    {stats?.payments?.outstanding || 0} <small style={{ fontSize: "0.8rem" }}>dh</small>
                                </div>
                                <small className="text-muted"><Lang>Outstanding balance</Lang></small>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1: Turnover, New Customers, Subscriptions */}
                    <div className="row m-0 p-2">
                        <div className="col-12 col-md-4 p-2">
                            <div style={cardStyle}>
                                <h6 className="fw-bold text-center mb-1"><Lang>Turnover</Lang></h6>
                                <p className="text-center text-muted mb-2" style={{ fontSize: "0.78rem" }}>{monthName}</p>
                                <div style={{ height: "200px" }}>
                                    <Line
                                        data={{
                                            labels: turnoverLabels,
                                            datasets: [{
                                                label: appState.langData["Revenue"] || "Revenue",
                                                data: turnoverData,
                                                borderColor: "#f0920a",
                                                backgroundColor: "rgba(240, 146, 10, 0.12)",
                                                tension: 0.4,
                                                fill: true,
                                            }],
                                        }}
                                        options={{ ...lineOptions, plugins: { legend: { display: false } } }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 p-2">
                            <div style={cardStyle}>
                                <h6 className="fw-bold text-center mb-1"><Lang>New Customers</Lang></h6>
                                <p className="text-center text-muted mb-2" style={{ fontSize: "0.78rem" }}>{monthName}</p>
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
                            </div>
                        </div>
                        <div className="col-12 col-md-4 p-2">
                            <div style={cardStyle}>
                                <h6 className="fw-bold text-center mb-1"><Lang>Subscriptions</Lang></h6>
                                <p className="text-center text-muted mb-2" style={{ fontSize: "0.78rem" }}>{monthName}</p>
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
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2: State Pie + Plan Bar */}
                    <div className="row m-0 p-2">
                        <div className="col-12 col-md-5 p-2">
                            <div style={cardStyle}>
                                <h6 className="fw-bold text-center"><Lang>Subscriptions Per state</Lang></h6>
                                <div style={{ height: "250px", display: "flex", justifyContent: "center" }}>
                                    <Pie
                                        data={{
                                            labels: [
                                                appState.langData["Active"] || "Active",
                                                appState.langData["Pre-expire"] || "Pre-expire",
                                                appState.langData["Expired"] || "Expired",
                                                appState.langData["Upcoming"] || "Upcoming",
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
                                                    labels: { usePointStyle: true, pointStyle: "line" },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-7 p-2">
                            <div style={cardStyle}>
                                <h6 className="fw-bold text-center"><Lang>Subscriptions Per Plan</Lang></h6>
                                <div style={{ height: "250px" }}>
                                    <Bar
                                        data={{
                                            labels: planNames,
                                            datasets: [
                                                { label: appState.langData["Men"] || "Men", data: planMen, backgroundColor: "#1a3a4a" },
                                                { label: appState.langData["Women"] || "Women", data: planWomen, backgroundColor: "#f0920a" },
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
                            </div>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
}
