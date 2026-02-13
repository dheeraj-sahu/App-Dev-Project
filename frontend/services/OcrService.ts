export const OcrService = {
    parseImage: async (uri: string): Promise<{ text: string | null; error?: string }> => {
        try {
            const formData = new FormData();
            formData.append("file", {
                uri: uri,
                type: "image/jpeg", // Ensure this matches the extension or detect it
                name: "upload.jpg",
            } as any);

            // TODO: Move API key to env variable
            formData.append("apikey", "K87899142388957");
            formData.append("language", "eng");
            formData.append("isOverlayRequired", "false");

            const response = await fetch("https://api.ocr.space/parse/image", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.OCRExitCode === 1 && result.ParsedResults) {
                const text = result.ParsedResults[0].ParsedText.trim();
                return { text };
            } else {
                return { text: null, error: result.ErrorMessage?.[0] || "OCR Server error." };
            }
        } catch (error) {
            console.error("OCR Error: ", error);
            return { text: null, error: "Network error during OCR." };
        }
    }
};
