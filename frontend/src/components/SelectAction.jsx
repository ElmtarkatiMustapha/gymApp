import { Lang } from "../assets/js/lang"

export function SelectAction({options, onChange,id = 0, defTitle = "Actions", defaultValue = "default", defaultOption= "default"}) {
    return (
        <select onChange={onChange} data-id={id} className=" form-select select-action" defaultValue={defaultValue}>
            <option value={defaultOption}><Lang>{defTitle}</Lang></option>
            {options?.map((item) => {
                return <option key={item.value?item.value : item.id } value={item.value?item.value : item.id}><Lang>{item.name}</Lang></option>
            })}
        </select>
    )
}