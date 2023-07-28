import "./Navbar.css";
import {NavigateFunction, useLocation, useNavigate} from 'react-router-dom';
import { CSSProperties } from "react";
import {useAppContext} from "../libs/contextLib";
import {Auth} from "aws-amplify";
import logo from "../assets/logo.png";

export const Navbar = ({ transparent, position }: { transparent: boolean, position: string }) => {
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const { isAuthenticated, userHasAuthenticated } = useAppContext();

    function Style(): CSSProperties {
        const returnParam: any = {};
        if (position === 'fixed-top') {
            returnParam.position = 'fixed';
            returnParam.top = '0';
        }
        if (transparent) {
            returnParam.backgroundColor = 'transparent';
        } else {
            returnParam.backgroundColor = 'white';
        }

        return returnParam;
    }

    function handleNavClick(location: string) {
        if (location === 'logout') {
            handleLogout();
        } else {
            navigate('/' + location);
        }
    }

    function handleBackClick() {
        navigate(-1);
    }

    async function handleLogout() {
        await Auth.signOut();
        userHasAuthenticated(false);
        navigate("/login");
    }

    return (
        <div className="nav-bar" style={Style()}>
            <div className="section menu-button float-left">
            { location.pathname !== '/' && <svg onClick={() => handleBackClick()} className="back pointer" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
            </svg>}
            </div>
            <div className="section pointer" onClick={() => handleNavClick('')}>
                <img className="logo" src={logo} height="50" alt="Nguyen Technologies & Electrical Equipment" />
            </div>
            <div className="section float-right">
                {!isAuthenticated ?
                <div className="menu-button pointer" onClick={() => handleNavClick('login')}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4H11M3 12H14M14 12L11 15M14 12L11 9" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                :
                    <div className="menu-button pointer" onClick={() => handleNavClick('logout')}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="Interface / Log_Out">
                                <path id="Vector" d="M12 15L15 12M15 12L12 9M15 12H4M9 7.24859V7.2002C9 6.08009 9 5.51962 9.21799 5.0918C9.40973 4.71547 9.71547 4.40973 10.0918 4.21799C10.5196 4 11.0801 4 12.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H12.1969C11.079 20 10.5192 20 10.0918 19.7822C9.71547 19.5905 9.40973 19.2839 9.21799 18.9076C9 18.4798 9 17.9201 9 16.8V16.75" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                        </svg>
                    </div>

                }
            </div>
        </div>
    )
}

export default Navbar;