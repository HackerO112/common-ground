import { useEffect, useState } from "react";

// Uploaded files are served directly at /uploads/filename — no signed URL needed.
export function useSignedUrl(fileUri) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!fileUri) {
      setUrl(null);
      return undefined;
    }
    // fileUri is already a direct path like /uploads/xxx.jpg
    setUrl(fileUri);
    return undefined;
  }, [fileUri]);

  return url;
}
