export interface BaseMetadata {
    capitalized_name: string,
    brief?: string,
    description: string
}

export interface EngineSpecMetadata extends BaseMetadata {
    usages: string[]
}

export interface RGBColor {
    r: number,
    g: number,
    b: number
}