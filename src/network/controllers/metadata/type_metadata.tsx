export interface BaseMetadata {
    capitalized_name: string,
    description: string
}

// TODO: fill these classes and the missing ones
export interface MetadataHeader {
    meta_version: number,
    types_version: number
}

export interface NodeTypeMeta extends BaseMetadata {

}

export interface DataTypeMeta extends BaseMetadata {

}