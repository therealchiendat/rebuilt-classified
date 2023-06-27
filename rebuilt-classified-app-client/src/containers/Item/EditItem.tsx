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
    const [originalPhotos, setOriginalPhotos] = useState([]);
    const [currentPhotos, setCurrentPhotos] = useState([]);
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
                const { title, content, price, type, photo, attachment, specifications } = item;
                let imageURLs = [];
                let attachmentURLs = [];
                let originalPhoto = [];
                let originalAttachment = [];
                if (photo) {
                    imageURLs = await Promise.all(
                        photo.map((photo) => {
                            return Storage.get(photo);
                        })
                    );
                    originalPhoto = [...photo];
                }
                if (attachment) {
                    attachmentURLs = await Promise.all(
                        attachment.map((attachment) => {
                            return Storage.get(attachment);
                        })
                    );
                    originalAttachment = attachment.map((attachment, index) => ({
                        name: attachment, 
                        url: attachmentURLs[index],
                    }));
                }
                setPreviews(imageURLs);
                setOriginalAttachments(originalAttachment);
                setCurrentAttachments(originalAttachment);
                setOriginalPhotos(originalPhoto);
                setCurrentPhotos(originalPhoto);
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

    function handlePhotoChange(event) {
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
        const combinedPhotos = [...currentPhotos, ...newFiles];
        setCurrentPhotos(combinedPhotos);

        const combinedPreviews = [
            ...previews,
            ...newFiles.map((file: Blob) => URL.createObjectURL(file)),
        ];

        file.current = combinedPhotos;
        setPreviews(combinedPreviews);
    }

    function handleAttachmentChange(event) {
        const newFiles: Array<Blob> = Array.from(event.target.files);
        const invalidFiles: Array<Blob> = newFiles.filter(
            (file) => file.size > config.MAX_ATTACHMENT_SIZE
        );
        if (invalidFiles.length > 0) {
            alert(
                `One or more of the selected files are larger than ${config.MAX_ATTACHMENT_SIZE / 1000000
                } MB.`
            );
            return;
        }
        const combinedAttachments = [...currentAttachments, ...newFiles];
        setCurrentAttachments(combinedAttachments);
    }

    function removeAttachment(index) {
        setCurrentAttachments(currentAttachments.filter((_, i: number): boolean => i !== index));
    }

    function removePhoto(index) {
        setCurrentPhotos(
            currentPhotos.filter((_, i) => i !== index)
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

    function createURL(file) {
        let returnURL: string;
        if (file instanceof File) {
            returnURL = URL.createObjectURL(new Blob([file]));
        } else {
            returnURL = file.url;
        };
        return returnURL;
    }


    async function handleSubmit(event) {
        event.preventDefault();

        setIsLoading(true);
        try {
            const toUploadPhotos = currentPhotos.filter(
                (photo) => !originalPhotos.includes(photo)
            );
            const toRemovePhotos = originalPhotos.filter(
                (photo) => !currentPhotos.includes(photo)
            );

            const uploadedPhotos = await Promise.all(
                toUploadPhotos.map((photo) => s3Upload(photo))
            );

            await Promise.all(toRemovePhotos.map((photo) => {
                return Storage.remove(photo);
            }));

            const updatedPhotos = [
                ...originalPhotos.filter((photo) =>
                    currentPhotos.includes(photo)
                ),
                ...uploadedPhotos,
            ];

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
            ].map((attachment) => attachment.name);

            const payload = { ...fields, photo: updatedPhotos, attachment: updatedAttachments, specifications };
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
                                    <button className="x-button" type={"button"} onClick={() => removeSpecification(index)}>x</button>
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
                    <label>Photos</label>
                    <div className="photo-container">
                        <label className="photo-label" htmlFor="photo-input">
                            <div className="photo-placeholder">+</div>
                        </label>
                        <input
                            id="photo-input"
                            className="photo-input"
                            type="file"
                            onChange={handlePhotoChange}
                            multiple
                            hidden
                        />
                        <div className="preview-container">
                            {previews.map((preview, index) => (
                                <div className="preview-wrapper" key={index}>
                                    <img
                                        className="preview"
                                        src={preview}
                                        alt={`Photos ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className="remove-photo"
                                        onClick={() => removePhoto(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label>Attachments</label>
                    <label className="attachment-label" htmlFor="attachment-input">
                            <div className="attachment-placeholder">Add Attachment</div>
                        </label>
                    <input
                        id="attachment-input"
                        className="attachment-input"
                        type="file"
                        onChange={handleAttachmentChange}
                        multiple
                    />
                    <ul>
                        {currentAttachments.map((attachment, index) => (
                            <li key={index}>
                                <a href={createURL(attachment)} download target="_blank" rel="noreferrer">
                                    {attachment.name}
                                </a>
                                <button
                                    type="button"
                                    className="x-button"
                                    onClick={() => removeAttachment(index)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
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
