import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../../libs/errorLib";
import config from "../../config";
import "./EditItem.css";
import { s3Upload } from "../../libs/awsLib";
import { useFormFields } from "../../libs/hooksLib";
import {itemSpecification} from "../../libs/types";

export default function EditItem() {
    const { id } = useParams();
    const file = useRef([]);
    const navigate = useNavigate();
    const [fields, handleFieldChange, setFieldValues] = useFormFields({
        title: "",
        content: "",
        price: "",
        type: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [originalAttachments, setOriginalAttachments] = useState([]);
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [specifications, setSpecifications] = useState<itemSpecification[]>([]);

    useEffect(() => {
        async function fetchItem() {
            return API.get("item", `item/${id}`, {});
        }

        async function onLoad() {
            try {
                const item = await fetchItem();
                const { title, content, price, type, attachment, specifications } = item;
                let imageURLs = [];
                let originalURLs = [];
                if (attachment) {
                    imageURLs = await Promise.all(
                        attachment.map((attachment) => {
                            return Storage.get(attachment);
                        })
                    );
                    originalURLs = [...attachment];
                }
                setPreviews(imageURLs);
                setOriginalAttachments(originalURLs);
                setCurrentAttachments(originalURLs);
                setSpecifications(specifications);
                setFieldValues({
                    ...fields,
                    title: title,
                    content: content,
                    price: price,
                    type: type,
                });
                setIsLoading(false);
            } catch (e) {
                onError(e);
            }
        }

        onLoad();
    // eslint-disable-next-line
    }, [id]);

    function validateForm() {
        return (
            fields.title.length > 0 &&
            fields.content.length > 0 &&
            fields.price.length > 0 &&
            fields.type.length > 0 &&
            specifications.length > 0
        );
    }

    function handleFileChange(event) {
        const newFiles: Array<Blob> = Array.from(event.target.files);
        const invalidFiles: Array<Blob> = newFiles.filter(
            (file) => file.size > config.MAX_ATTACHMENT_SIZE
        );
        if (invalidFiles.length > 0) {
            alert(
                `One or more of the selected files are larger than ${
                    config.MAX_ATTACHMENT_SIZE / 1000000
                } MB.`
            );
            return;
        }
        const combinedAttachments = [...currentAttachments, ...newFiles];
        setCurrentAttachments(combinedAttachments);

        const combinedPreviews = [
            ...previews,
            ...newFiles.map((file: Blob) => URL.createObjectURL(file)),
        ];

        file.current = combinedAttachments;
        setPreviews(combinedPreviews);
    }

    function removeAttachment(index) {
        setCurrentAttachments(
            currentAttachments.filter((_, i) => i !== index)
        );
        setPreviews(previews.filter((_, i) => i !== index));
    }

    function addSpecification() {
        setSpecifications([...specifications, {key: "", value: ""}]);
    }

    function handleSpecificationKeyChange(index, event) {
        const updatedSpecifications = [...specifications];
        updatedSpecifications[index].key = event.target.value;
        setSpecifications(updatedSpecifications);
    }

    function handleSpecificationValueChange(index, event) {
        const updatedSpecifications = [...specifications];
        updatedSpecifications[index].value = event.target.value;
        setSpecifications(updatedSpecifications);
    }

    function removeSpecification(index) {
        const newSpecifications = [...specifications];
        newSpecifications.splice(index, 1);
        setSpecifications(newSpecifications);
    }


    async function handleSubmit(event) {
        event.preventDefault();

        setIsLoading(true);
        try {
            const toUpload = currentAttachments.filter(
                (attachment) => !originalAttachments.includes(attachment)
            );
            const toRemove = originalAttachments.filter(
                (attachment) => !currentAttachments.includes(attachment)
            );


            const uploadedAttachments = await Promise.all(
                toUpload.map((attachment) => s3Upload(attachment))
            );

            await Promise.all(toRemove.map((attachment) => {
                return Storage.remove(attachment);
            }));

            const updatedAttachments = [
                ...originalAttachments.filter((attachment) =>
                    currentAttachments.includes(attachment)
                ),
                ...uploadedAttachments,
            ];

            const payload = { ...fields, attachment: updatedAttachments, specifications };
            await updateItem(payload);
            navigate("/");
        } catch (e) {
            onError(e);
        }
        setIsLoading(false);
    }

    function updateItem(item) {
        return API.put("item", `item/${id}`, {
            body: item,
        });
    }

    return (
        <div className="EditItem">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        autoFocus
                        id="title"
                        type="text"
                        onChange={handleFieldChange}
                        value={fields.title}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Item Description</label>
                    <textarea
                        id="content"
                        onChange={handleFieldChange}
                        value={fields.content}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        id="price"
                        type="text"
                        onChange={handleFieldChange}
                        value={fields.price}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="type">Type</label>
                    <input
                        id="type"
                        disabled
                        type="text"
                        onChange={handleFieldChange}
                        value={fields.type}
                    />
                </div>
                <div className="specifications">
                    <label>Specifications</label>
                    <table>
                        <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {specifications?.map((specification, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        value={specification.key}
                                        onChange={(event) => handleSpecificationKeyChange(index, event)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={specification.value}
                                        onChange={(event) => handleSpecificationValueChange(index, event)}
                                    />
                                </td>
                                <td>
                                    <button type={"button"} onClick={() => removeSpecification(index)}>x</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button type="button" onClick={addSpecification}>
                        Add Specification
                    </button>
                </div>
                <div className="form-group">
                    <label>Attachments</label>
                    <div className="attachment-container">
                        <label className="attachment-label" htmlFor="attachment-input">
                            <div className="attachment-placeholder">+</div>
                        </label>
                        <input
                            id="attachment-input"
                            className="attachment-input"
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            hidden
                        />
                        <div className="preview-container">
                            {previews.map((preview, index) => (
                                <div className="preview-wrapper" key={index}>
                                    <img
                                        className="preview"
                                        src={preview}
                                        alt={`Attachment ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className="remove-attachment"
                                        onClick={() => removeAttachment(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    type="submit"
                    disabled={!validateForm()}
                >
                    {isLoading ? "Updating..." : "Update"}
                </button>
            </form>
        </div>
    );

}
