import {useEffect, useRef, useState} from "react";

export function useImageLoaded() {
    const [loaded, setLoaded] = useState<any>(false);
    const ref = useRef<HTMLImageElement>();

    const onLoad = () => {
        setLoaded(true);
    }

    useEffect(() => {
        if (ref.current && ref.current.complete) {
            onLoad();
        }
    })

    return [ref, loaded, onLoad];
}
