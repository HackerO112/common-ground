import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Issue photos are stored privately, so a short-lived signed link is minted
// whenever one needs to be shown.
export function useSignedUrl(fileUri) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;
    if (!fileUri) {
      setUrl(null);
      return undefined;
    }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 })
      .then((result) => {
        if (active) setUrl(result?.signed_url ?? null);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [fileUri]);

  return url;
}