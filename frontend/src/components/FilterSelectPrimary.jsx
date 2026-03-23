import { Lang } from "../assets/js/lang"

export function FilterSelectPrimary({ options, onChange, id = 0, defTitle = "Actions", defaultValue = "default", defaultOption = "default" }) {
    return (
        <select onChange={onChange} data-id={id} className="form-select pt-1 pb-1 filter-select-primary w-auto" defaultValue={defaultValue}>
            <option value={defaultOption}><Lang>{defTitle}</Lang></option>
            {options?.map((item) => {
                return <option key={item.value ? item.value : item.id} value={item.value ? item.value : item.id}><Lang>{item.name}</Lang></option>
            })}
        </select>
    )
}