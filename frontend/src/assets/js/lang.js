import { useAppState } from "../../context/context";
export function Lang({ children }) {
  const state = useAppState();
  return state.langData[children] !== "" && state.langData[children]
    ? state.langData[children]
    : children;
}
