import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { useSignedUrl } from "@/lib/useSignedUrl";

export default function SignedPhoto({ fileUri, alt, className }) {
  const url = useSignedUrl(fileUri);

  if (!url) {
    return <div className={cn("animate-pulse bg-muted", className)} aria-hidden="true" />;
  }

  return <Image src={url} alt={alt} className={className} fittingType="fill" />;
}