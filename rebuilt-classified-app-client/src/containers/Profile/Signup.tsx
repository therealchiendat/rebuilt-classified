import React, { useState, FormEvent } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAppContext } from "../../libs/contextLib";
import { useFormFields } from "../../libs/hooksLib";
import { onError } from "../../libs/errorLib";
import "./Signup.css";
import { Auth } from "aws-amplify";


export default function Signup() {
    const [fields, handleFieldChange] = useFormFields({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        confirmationCode: "",
    });
    const navigate: NavigateFunction = useNavigate();
    const [newUser, setNewUser] = useState<null | unknown>(null);
    const { userHasAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        return (
            fields.email.length > 0 &&
            fields.password.length > 0 &&
            fields.password === fields.confirmPassword
        );
    }

    function validateConfirmationForm() {
        return fields.confirmationCode.length > 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        try {
            const newUser = await Auth.signUp({
                username: fields.username,
                password: fields.password,
                attributes: {
                    email: fields.email
                }
            });
            setIsLoading(false);
            setNewUser(newUser);
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    async function handleConfirmationSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            await Auth.confirmSignUp(fields.username, fields.confirmationCode);
            await Auth.signIn(fields.username, fields.password);
            userHasAuthenticated(true);
            navigate("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function renderConfirmationForm() {
        return (
            <form onSubmit={handleConfirmationSubmit}>
                <div>
                    <label htmlFor="confirmationCode">Confirmation Code</label>
                    <input
                        autoFocus
                        id="confirmationCode"
                        type="tel"
                        onChange={handleFieldChange}
                        value={fields.confirmationCode}
                    />
                    <small>Please check your email for the code.</small>
                </div>
                <button
                    type="submit"
                    disabled={!validateConfirmationForm()}
                >
                    {isLoading ? "Verifying..." : "Verify"}
                </button>
            </form>
        );
    }

    function renderForm() {
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        autoFocus
                        id="username"
                        type="text"
                        value={fields.username}
                        onChange={handleFieldChange}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        autoFocus
                        id="email"
                        type="email"
                        value={fields.email}
                        onChange={handleFieldChange}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={fields.password}
                        onChange={handleFieldChange}
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        onChange={handleFieldChange}
                        value={fields.confirmPassword}
                    />
                </div>
                <button
                    disabled={!validateForm()}
                >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
        );
    }

    return (
        <div className="Signup">
            {newUser === null ? renderForm() : renderConfirmationForm()}
        </div>
    );
}