export function StatisticBox({label, value, color}){
    return(
        <div className={`box rounded-2 p-3 pt-2 pb-2 text-${color}`}>
            <div className="title pt-1 pb-1">{label}</div>
            <div className="info text-center fw-bold fs-2 pt-1 pb-1">{value}</div>
        </div>
    )
}