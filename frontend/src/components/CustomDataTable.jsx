import DataTable from "react-data-table-component";
import { useAppState } from "../context/context";
import { CustomLoader } from "./CustomLoader";
import { Lang } from "../assets/js/lang";

export function CustomDataTable({ columns, data, loading }) {
    const appState = useAppState();

    return (
        <div className="col-12 p-2 dataTableBox rounded-3 items w-100" style={{ width: "100%", overflowX: "auto" }}>
            <DataTable
                columns={columns}
                data={data}
                customStyles={appState.tableStyle}
                pagination
                progressPending={loading}
                noDataComponent={
                    <div style={{ padding: "20px", fontSize: "16px" }}>
                        <Lang>No records available</Lang>
                    </div>
                }
                responsive
                progressComponent={<CustomLoader />}
            />
        </div>
    );
}