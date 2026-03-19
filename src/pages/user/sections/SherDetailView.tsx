import { ArrowLeft, Heart, Share2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Content, ContentService } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { useFavouriteContent } from "@/hooks/useFavourite";
import ShareDialog from "@/components/ShareDialog";

const SherDetailView = () => {
    const { t, isUrdu, transliterate } = useLanguage();
    const { contentId, id: poetId } = useParams();
    const navigate = useNavigate();
    const [sher, setSher] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const { favIds, toggleFav } = useFavouriteContent();
    const [allShers, setAllShers] = useState<Content[]>([]);

    useEffect(() => {
        const fetchSher = async () => {
            if (!contentId) return;
            try {
                const data = await ContentService.getContentById(contentId);
                setSher(data);
            } catch (err) {
                console.error("Failed to fetch sher:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSher();
    }, [contentId]);

    // Fetch all shers for this poet to enable prev/next navigation
    useEffect(() => {
        const fetchAll = async () => {
            if (!poetId) return;
            try {
                const all = await ContentService.getContentByPoet(poetId);
                setAllShers(all.filter((c) => c.type === "SHER"));
            } catch (err) {
                console.error("Failed to fetch all shers:", err);
            }
        };
        fetchAll();
    }, [poetId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rekhta-gold" />
            </div>
        );
    }

    if (!sher) return <div className="text-rekhta-light text-center py-12">{t("sherNotFound")}</div>;

    const couplets = sher.textContent?.split("\n\n") || [];

    let parsedMediaFiles: string[] = [];
    try {
        if (sher.mediaFiles) {
            parsedMediaFiles = JSON.parse(sher.mediaFiles);
        }
    } catch (e) {
        console.error("Failed to parse media files", e);
    }

    // Determine prev/next
    const currentIndex = allShers.findIndex((s) => s.id === sher.id);
    const prevSher = currentIndex > 0 ? allShers[currentIndex - 1] : null;
    const nextSher = currentIndex < allShers.length - 1 ? allShers[currentIndex + 1] : null;

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 text-rekhta-muted hover:text-rekhta-light">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back")}
            </Button>

            <div className="mb-6">
                <h2 className={`text-2xl font-bold text-rekhta-light ${isUrdu ? "font-nastaliq text-3xl" : ""}`}>
                    {transliterate(sher.title)}
                </h2>
            </div>

            {parsedMediaFiles.length > 0 && (
                <div className="mb-8 overflow-hidden space-y-4">
                    {/* <h3 className="text-lg font-medium text-rekhta-gold">
                        {t("images")}
                    </h3> */}
                    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide items-center">
                        {parsedMediaFiles.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Sher image ${i + 1}`}
                                className="h-60 w-auto shrink-0 snap-center rounded-lg border border-rekhta-border/50 object-cover shadow-sm md:h-80 hover:scale-[1.02] transition-transform cursor-pointer"
                                loading={i === 0 ? "eager" : "lazy"}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-6 mb-8">
                {couplets.map((couplet, i) => (
                    <div key={i} className="rounded-lg border border-rekhta-border bg-rekhta-card/20 p-5">
                        <pre
                            className={`whitespace-pre-wrap leading-loose text-rekhta-light/90 ${isUrdu ? "font-nastaliq text-xl text-center" : "font-serif text-lg text-center"
                                }`}
                        >
                            {transliterate(couplet)}
                        </pre>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFav(sher.id)}
                    className="text-rekhta-muted hover:text-rekhta-red"
                >
                    <Heart className={`h-5 w-5 ${favIds.has(sher.id) ? "fill-rekhta-red text-rekhta-red" : ""}`} />
                </Button>
                <ShareDialog
                    url={window.location.href}
                    title={sher.title}
                    trigger={
                        <Button variant="ghost" size="icon" className="text-rekhta-muted hover:text-rekhta-light">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    }
                />
            </div>

            {/* Previous / Next Navigation */}
            {allShers.length > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-rekhta-border pt-6">
                    {prevSher ? (
                        <Link
                            to={`/poet/${poetId}/sher/${prevSher.id}`}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="flex items-center gap-2 text-rekhta-muted hover:text-rekhta-gold transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">پچھلی</span>
                                <span className="hidden sm:inline text-sm">{transliterate(prevSher.title)}</span>
                            </div>
                        </Link>
                    ) : (
                        <div />
                    )}
                    {nextSher ? (
                        <Link
                            to={`/poet/${poetId}/sher/${nextSher.id}`}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="flex items-center gap-2 text-rekhta-muted hover:text-rekhta-gold transition-colors text-right"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">اگلی</span>
                                <span className="hidden sm:inline text-sm">{transliterate(nextSher.title)}</span>
                            </div>
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>
            )}
        </div>
    );
};

export default SherDetailView;
