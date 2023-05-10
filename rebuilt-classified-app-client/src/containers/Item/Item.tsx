import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {API, Storage} from "aws-amplify";
import {onError} from "../../libs/errorLib";
import "./Item.css";
import Carousel from "../../components/Carousel";
import {itemSpecification} from "../../libs/types";
import {useAppContext} from "../../libs/contextLib";
export default function Item() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAppContext();
    const [item, setItem] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("")
    const [specifications, setSpecifications] = useState<itemSpecification[]>();
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        function fetchItem() {
            return API.get("item", `item/${id}`,{});
        }
        async function onLoad() {
            try {
                const item = await fetchItem();
                const { title, content, price, attachment, specifications } = item;
                if (attachment) {
                    let imageURLs = [];
                    imageURLs = await Promise.all(attachment.map((attachment) => {
                        return Storage.get(attachment)
                    }));
                    item.image = imageURLs;
                }
                setContent(content);
                setTitle(title);
                setItem(item);
                setPrice(price);
                setSpecifications(specifications);
                setIsLoading(false);
            } catch (e) {
                onError(e);
            }
        }
        onLoad();
    }, [id]);

    async function deleteItem() {
        try {
            const item = await API.get("item", `item/${id}`, {});
            if (item.attachment && item.attachment.length > 0) {
                const deletePromises = item.attachment.map(async (attachment) => {
                    return Storage.remove(attachment);
                });
                await Promise.all(deletePromises);
            }
            await API.del("item", `item/${id}`, {});
        } catch (e) {
            onError(e);
        }
    }
    async function handleDelete(event) {
        event.preventDefault();
        const confirmed = window.confirm(
            "Are you sure you want to delete this item?"
        );
        if (!confirmed) {
            return;
        }
        setIsDeleting(true);
        try {
            await deleteItem();
            navigate("/");
        } catch (e) {
            onError(e);
            setIsDeleting(false);
        }
    }

    function handleEdit() {
        navigate(`/item/${id}/edit`)
    }

    return (
        <div className="Item">
            <div className="image-container">
                {!isLoading && <Carousel images={item.image}/>}
            </div>
            <h2>{title}</h2>
            <div className={"description"}>{content}</div>
            <div className="table-container">
                <label>Specifications</label>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                    {specifications?.map((specification, index) => (
                        <tr key={index}>
                            <td>{specification.key}</td>
                            <td>{specification.value}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <p className={"price"}>Price: {price}</p>

            {isAuthenticated && <button type={"button"} onClick={handleEdit}>Edit</button>}
            {isAuthenticated && <button className="delete-button" type={"button"}
                     onClick={handleDelete}>{isDeleting ? "Deleting" : "Delete"}</button>}
        </div>
    );
}