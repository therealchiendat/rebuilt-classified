import React, { cloneElement } from "react";
import { Navigate } from "react-router-dom";
import {useAppContext} from "../libs/contextLib";
export default function UnauthenticatedRoute(props) {
    const { isAuthenticated } = useAppContext();
    const { children } = props;
    if (isAuthenticated) {
        return <Navigate to={"/"} />;
    }
    return cloneElement(children, props);
}