/**
 * @usage this is the dropdown list to control the language 
 * @returns jsx component 
 */
import { useAppAction, useAppState } from "../context/context";
import dataLang from "../data/langList.json"
export function LangSelect() {
    const langList = dataLang.langages;
    const state = useAppState();
    const dispatch = useAppAction();
    const handleLang = (e) => {
        console.log("change lang")
        fetch(`/langs/${e.target.value}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                dispatch({type: "CHG_LANG", payload: e.target.value})
                dispatch({type: "CHG_LANG_DATA", payload: data})
            });
    }
    
    return (
        <select defaultValue={state.currentLang} onChange={handleLang} className="slectLang rounded-pill form-select d-inline">
            {
                langList?.map((elem) => {
                    return (
                        <option key={elem.symbol} value={elem.file}>{elem.title}</option>
                    )
                })
            }
        </select>
    )
}