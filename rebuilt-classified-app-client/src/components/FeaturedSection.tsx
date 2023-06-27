import './FeaturedSection.css';
import { useNavigate } from "react-router-dom";
export default function FeaturedSection({ data, title }: { data: any, title: string }) {
    const navigate = useNavigate();

    function handleItemClick(id: string) {
        navigate('/definitelynotmerch/' + id);
    }

    function formatPrice(variants: any[]) {
        const prices = variants.map((variant: any) => Number(variant.price));
        const minprice = Math.min(...prices);
        return `$${minprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} CAD`;
    }

    return (
        <div className="featured-section">
            <div className="header">
                <h1>{title}</h1>
            </div>
            <div className="content">
                {data.map((dataItem: any, i: number) => {
                    return (
                        <div key={dataItem.id} className='item' onClick={() => handleItemClick(dataItem.id)}>
                            <div>
                                <img src={dataItem.images[0].src} alt={dataItem.images[0].alt} />
                                <p>{dataItem.title}</p>
                                <p>from {formatPrice(dataItem.variants)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}