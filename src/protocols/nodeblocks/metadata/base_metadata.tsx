export interface BaseMetadata {
    capitalized_name: string,
    brief?: string,
    description: string
}

export interface EngineSpecMetadata extends BaseMetadata {
    usages: string[]
}
