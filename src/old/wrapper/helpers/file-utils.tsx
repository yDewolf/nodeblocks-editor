export function downloadToFile(content: string, filename: string, contentType: string = "json") {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    
    URL.revokeObjectURL(url);
}