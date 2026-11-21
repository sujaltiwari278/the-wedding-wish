import Link from "next/link";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";

export default function WeddingNotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 border-4 border-deep bg-soft-blush mx-auto flex items-center justify-center text-4xl shadow-pixel">
          💔
        </div>

        <div className="space-y-2">
          <div className="inline-block bg-rose-dusty text-deep font-pixel text-[10px] px-3 py-1 border-2 border-deep shadow-pixel-sm uppercase">
            ERROR 404: REALM UNCHARTED
          </div>
          <h1 className="font-pixel text-xl md:text-2xl text-deep">
            WEDDING NOT FOUND
          </h1>
          <p className="font-retro text-2xl text-deep/80">
            This wedding registry realm does not exist or the link may have been misspelled.
          </p>
        </div>

        <PixelCard variant="default" shadow="md">
          <p className="font-retro text-lg text-deep/80 mb-4">
            If you were given a 8-character Wedding Code, you can enter it directly on our home portal.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/">
              <PixelButton variant="primary" size="md">
                RETURN TO HOME
              </PixelButton>
            </Link>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
