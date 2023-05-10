import { Routes ,Route } from 'react-router-dom';
import FourOhFour from './containers/404/FourOhFour';
import Home from "./containers/Home/Home";
import Item from "./containers/Item/Item";
import Login from "./containers/Profile/Login"
import Signup from "./containers/Profile/Signup";
import NewItem from "./containers/Item/NewItem";
import EditItem from "./containers/Item/EditItem";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={
                    <UnauthenticatedRoute>
                        <Login />
                    </UnauthenticatedRoute>
                }
            />
            <Route path="/signup" element={
                    <UnauthenticatedRoute>
                        <Signup />
                    </UnauthenticatedRoute>
                }
            />
            <Route path="/item/new" element={
                <AuthenticatedRoute>
                    <NewItem />
                </AuthenticatedRoute>
            }/>
            <Route path="/item/:id" element={
                    <Item />
            }/>
            <Route path="/item/:id/edit" element={
                <AuthenticatedRoute>
                    <EditItem />
            </AuthenticatedRoute>}/>
            {/* Finally, catch all unmatched routes */}
            <Route path="*" element={<FourOhFour />}/>
        </Routes>
    );
}