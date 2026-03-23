import { useEffect, useState } from "react";
import { useAppState } from "../../context/context";
export function Lang({ children }) {
  const state = useAppState();
  const [data, setData] = useState("");
  // useEffect(() => {
  //   fetch(`/langs/${state.currentLang}`)
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then((data) => {
  //       setData(data);
  //     });
  // }, [state.currentLang]);
  // return data[children] !== "" && data[children] ? data[children] : children;
  return state.langData[children] !== "" && state.langData[children]
    ? state.langData[children]
    : children;
}