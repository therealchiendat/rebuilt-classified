import React, {useEffect, useState} from "react";
import "./ListItem.css";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {Storage} from "aws-amplify";
import Carousel from "../../components/Carousel";
import SpecFilter from "../../components/SpecFilter";

export default function ListItem({data, isAuthenticated, isLoading,...rest}) {
    const navigate: NavigateFunction = useNavigate();
    const [item, setItem] = useState([]);
    const [typeFilter, setTypeFilter] = useState("");
    const [priceFilter, setPriceFilter] = useState("");
    const [isListLoading, setIsListLoading] = useState(false);
    const [specFilters, setSpecFilters] = useState<Record<string, Array<string>>>({});
    const [filteredItemCount, setFilteredItemCount] = useState(0);


    useEffect(()=> {
        setIsListLoading(true);
    }, []);

    useEffect(() => {
        async function fetchAttachments() {
            const tempData = [...data];

            const promises = tempData.map(async (item) => {
                const { attachment } = item;
                item.images = await Promise.all(attachment.map((attachment) => Storage.get(attachment)));
                return item;
            });

            const updatedData = await Promise.all(promises);
            setItem(updatedData);
        }
        if (data && data.length > 0){
            fetchAttachments();
        }
    }, [data]);

    useEffect(() => {
        const specFilters = {};
        if (item) {
            item.forEach(itemElem => {
                itemElem.specifications.forEach((spec) => {
                    if (!specFilters.hasOwnProperty(spec.key)) {
                        specFilters[spec.key] = [];
                    }
                });
            })
            setSpecFilters(specFilters);
            setIsListLoading(false);
        }
    }, [item]);

    function handleCreateNewItem(event) {
        event.preventDefault();
        navigate('/item/new');
    }

    function handleItemClick(event, item) {
        event.preventDefault();
        navigate(`/item/${item}`)
    }


    function renderItemList(items) {
        const filteredItems = item.filter((item) => {
            if (typeFilter && item.type !== typeFilter) return false;
            if (priceFilter && Number(item.price) > Number(priceFilter)) return false;
            for (const [key, values] of Object.entries(specFilters)) {
                const itemValues = item.specifications?.filter((spec) => spec.key === key).map((spec) => spec.value);
                if (values.length > 0 && !values.some((v) => itemValues.includes(v))) return false;
            }
            return true;
        });
        return (
            <div className="items">
                <div className="header">
                    <h1>Classified Rebuilt Items</h1>
                    {isAuthenticated && <button onClick={handleCreateNewItem}>Create New Item</button>}
                </div>
                {item && <SpecFilter items={item} specFilters={specFilters} setSpecFilters={setSpecFilters}/>}
                <div className="filter">
                    <div>
                        <label htmlFor="type-filter">Filter by Type:</label>
                        <select id="type-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="">All</option>
                            {item.map(({ type }, index) => (
                                <option key={`type-option-filter-${type}-${index}`} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="price-filter">Filter by Price:</label>
                        <select id="price-filter" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                            <option value="">All</option>
                            {item.map(({ price }, index) => (
                                <option key={`price-option-filter-${price}-${index}`} value={price}>
                                    ${price} and under
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="content">
                    {!isListLoading &&
                        filteredItems.map(({ itemId, images, price, title }, index: number) => {
                            return (
                                <div key={itemId} className="item" onClick={(e) => handleItemClick(e, itemId)}>
                                    <div className="image-container">
                                        <Carousel images={images} />
                                    </div>

                                    <p>{title}</p>
                                    <p>${price}</p>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    }


    function renderItems() {
        return (
            <div className="notes">
                <div>{!isLoading && renderItemList(item)}</div>
            </div>
        );
    }
    return (
        <div className="ListItem">
            {renderItems()}
        </div>
    );
}