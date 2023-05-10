import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import ListItem from "../Item/ListItem";
import {useAppContext} from "../../libs/contextLib";
import {onError} from "../../libs/errorLib";
import "./Home.css";

export default function Home() {
    const [storeData, setStoreData] = useState<any>();
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function onLoad() {
            try {
                const storeData = await fetchItems();
                setStoreData(storeData);
            } catch (e) {
                onError(e);
            }
            setIsLoading(false);
        }
        onLoad();

    }, [isAuthenticated]);
    function fetchItems() {
        return API.get("item", "item", {});
    }

    return (
        <div className="Home">

            {storeData ?
                <ListItem data={storeData} isAuthenticated={isAuthenticated} isLoading={isLoading}/>
                : null
            }
        </div>
    )
}