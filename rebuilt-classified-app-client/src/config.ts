const config = {
    MAX_ATTACHMENT_SIZE: 10000000,
    s3: {
        REGION: "us-east-1",
        BUCKET: "rebuilt-classified-uploads"
    },
    apiGateway: {
        REGION: "us-east-1",
        URL: "https://vzliajtqc9.execute-api.us-east-1.amazonaws.com/prod/"
    },
    cognito: {
        REGION: "us-east-1",
        USER_POOL_ID: "us-east-1_dmkiqLcac",
        APP_CLIENT_ID: "3ucfvgd7udh1k3b798bnb3fssa",
        IDENTITY_POOL_ID: "us-east-1:25ddcc5d-c32a-442a-a2a4-ca8ee73d20c5"
    }
};

export default config;