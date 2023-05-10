import { useEffect, useState } from 'react';
import './SecretPassword.css';
export default function SecretPasswor({ variantID, callBack }) {

    const [guessedPW, setGuessedPW] = useState<string>('');
    const [lowPW, setLowPW] = useState<string>('0');
    const [highPW, setHighPW] = useState<string>('1000');
    const [correctGuessed, setCorrectGuessed] = useState<boolean>(false);
    const [discountedURL, setDiscountedURL] = useState<string>('');
    const [attempt, setAttempt] = useState<number>(0);
    useEffect(() => {
        init()
    }, []);

    async function init() {
        const reqBody = {
            "id": variantID
        }
        try {
            const result = await fetch('/init', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reqBody)
            })
            const parsedResult = await result.json();
            if (result.status === 409) {
                setCorrectGuessed(true);
                setDiscountedURL(parsedResult.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handlePWChange(event: React.FormEvent<HTMLInputElement>) {
        const newValue = event.currentTarget.value;
        setGuessedPW(newValue);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const reqBody = {
            "id": variantID,
            "password": guessedPW
        }
        const result = await fetch('/attempt', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody)
        })
        const parsedResult = await result.json();
        setAttempt(parsedResult.attempt);
        if (parsedResult.message === 'high') {
            setHighPW(guessedPW);
        } else if (parsedResult.message === 'low') {
            setLowPW(guessedPW);
        } else if (parsedResult.message === 'correct') {
            setDiscountedURL(parsedResult.data)
            setCorrectGuessed(true);
        } else {
            callBack(false);
        }
    }

    function handleDiscountClick() {
        window.open(discountedURL);
    }

    return (
        <div className="Secret">
            {!correctGuessed ?
                <div className="secret-form">
                    <div className="instruction">
                        <p>The password is between 0-1000;</p>
                        <p>You have {10-attempt} tries left to find the secret password</p>
                    </div>
                    <form className="content" onSubmit={handleSubmit}>
                        <span>{lowPW}-[<input value={guessedPW} onChange={handlePWChange}></input>]-{highPW}</span>
                        <button type="submit">Submit</button>
                    </form>
                </div>
                : <button type="button" onClick={handleDiscountClick}>Let's Get Discounted! &gt;</button>
            }

        </div>
    )
}