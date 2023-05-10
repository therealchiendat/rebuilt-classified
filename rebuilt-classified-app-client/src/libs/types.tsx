export interface itemData {
    userId: string,
    itemId: string,
    title: string,
    content: string,
    type: string,
    specifications: itemSpecification[],
    price: string,
    attachment: string,
    createdAt: string,
}

export interface itemSpecification {
    key: string,
    value: string
}