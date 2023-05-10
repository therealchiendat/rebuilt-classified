import React, { useState } from "react";
import { useAppContext } from "../../libs/contextLib";
import {NavigateFunction, useNavigate} from "react-router-dom";
import { onError } from "../../libs/errorLib";
import { Auth } from "aws-amplify";
import "./Login.css";
import {useFormFields} from "../../libs/hooksLib";

export default function Login() {
    const { userHasAuthenticated } = useAppContext();
    const navigate: NavigateFunction = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [fields, handleFieldChange] = useFormFields({
        email: "",
        password: ""
    });
    function validateForm() {
        return fields.email.length > 0 && fields.password.length > 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        try {
            await Auth.signIn(fields.email, fields.password);
            userHasAuthenticated(true);
            navigate("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }


    return (
        <div className="Login">
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                    autoFocus
                    type="email"
                    id="email"
                    value={fields.email}
                    onChange={handleFieldChange}
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={fields.password}
                    onChange={handleFieldChange}
                />

                <button type="submit" disabled={!validateForm()}>
                    {isLoading ? 'Logging In ...' : 'Log In'}
                </button>
            </form>
        </div>
    );
}
