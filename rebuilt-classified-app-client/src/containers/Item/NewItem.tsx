import React, {useRef, useState} from "react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {API} from "aws-amplify";
import {onError} from "../../libs/errorLib";
import config from "../../config";
import "./NewItem.css";
import {s3Upload} from "../../libs/awsLib";
import {useFormFields} from "../../libs/hooksLib";
import {itemSpecification} from "../../libs/types";

export default function NewItem() {
    const file = useRef([]);
    const navigate: NavigateFunction = useNavigate();
    const [fields, handleFieldChange] = useFormFields({
        title: "",
        content: "",
        price: "",
        type: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [specifications, setSpecifications] = useState<itemSpecification[]>([]);

    function validateForm() {
        return fields.title.length > 0 &&
            fields.content.length > 0 &&
            fields.price.length > 0 &&
            fields.type.length > 0 &&
            specifications.length > 0;
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
        const combinedFiles = [...file.current, ...newFiles];

        const combinedPreviews = [
            ...previews,
            ...newFiles.map((file: Blob) => URL.createObjectURL(file)),
        ];

        file.current = combinedFiles;
        setPreviews(combinedPreviews);
    }

    function removeAttachment(index) {
        setAttachments(attachments.filter((_, i: number): boolean => i !== index));
        setPreviews(previews.filter((_, i: number): boolean => i !== index));
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
            const uploadedAttachments = await Promise.all(
                file.current.map((file) => s3Upload(file))
            );

            const payload = {...fields, attachment: uploadedAttachments, specifications};
            await createItem(payload);
            navigate("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function createItem(item) {
        return API.post("item", "item", {
            body: item
        });
    }

    return (
        <div className="NewItem">
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
                                        alt={`Attachment ${index}`}
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
                    {isLoading ? "Creating..." : "Create"}
                </button>
            </form>
        </div>
    );
}
