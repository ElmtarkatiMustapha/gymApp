import { Navigate } from "react-router-dom";
import { useAppState } from "../context/context";
import { Component } from "react";
/**
 * logic of routes
 * 1) -PrivateRoute: for every user logged in the system
 * 2) -PrivateAdminRoute: private for administrateur  
 */

/**
 * @param {component} component the page to load 
 * @returns if user logged in return component else redirect to the login page
 */
export function PrivateRoute({component}) {
    const state = useAppState();
    return state.currentUser ? component : <Navigate to="/login" replace />
}

/**
 * AdminPrivateRoute for protect admin route
 * @param {component} component: the page to render 
 * @returns if user logged in and admin return component else if cachier redirect to pos page
 * else redirect to login page
 */
export function PrivateAdminRoute({ component }) {
    const state = useAppState();
    if (state.currentUser && state.userRole =="admin") {
        return component;
    } else if (state.currentUser) {
        return <Navigate to="/customers" replace/>
    } else {
        return <Navigate to="/login" replace/>
    }
}
//check if instaaled
export function CheckInstall({component}){
    const state = useAppState();
    return state.installed ? component : <Navigate to="/install" replace />
}
//check if not
export function CheckNotInstall({component}){
    const state = useAppState();
    return !state.installed ? component : <Navigate to="/" replace />
}
