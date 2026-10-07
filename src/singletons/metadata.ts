import { MetadataController } from "~/feature/metadata/metadata_controller";
import { session_controller } from "./user_session";

export const DocsPathSplitter = ".";
export const metadata = new MetadataController(session_controller.client);