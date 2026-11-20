use std::path::PathBuf;

pub fn path_str(path: &PathBuf) -> String {
    path.to_string_lossy().to_string()
}
