declare namespace NodeJS {
    interface ProcessEnv {
        readonly SESSION_SECRET: string
        readonly SERVER_HOST: string
        readonly SERVER_PORT: string
    }
}