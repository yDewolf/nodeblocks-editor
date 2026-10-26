declare namespace NodeJS {
    interface ProcessEnv {
        readonly SESSION_SECRET: string
        readonly SERVER_URL: string
    }
}