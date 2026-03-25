import { ArrowLeft, ArrowRight, Heart, Share2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Content, ContentService } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { useFavouriteContent } from "@/hooks/useFavourite";
import ShareDialog from "@/components/ShareDialog";

const GhazalDetailView = () => {
  const { t, isUrdu, transliterate } = useLanguage();
  const { contentId, id: poetId } = useParams();
  const navigate = useNavigate();
  const [ghazal, setGhazal] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const { favIds, toggleFav } = useFavouriteContent();
  const [allGhazals, setAllGhazals] = useState<Content[]>([]);

  useEffect(() => {
    const fetchGhazal = async () => {
      if (!contentId) return;
      try {
        const data = await ContentService.getContentById(contentId);
        setGhazal(data);
      } catch (err) {
        console.error("Failed to fetch ghazal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGhazal();
  }, [contentId]);

  // Fetch all ghazals for this poet to enable prev/next navigation
  useEffect(() => {
    const fetchAll = async () => {
      if (!poetId) return;
      try {
        const all = await ContentService.getContentByPoet(poetId);
        setAllGhazals(all.filter((c) => c.type === "GHAZAL"));
      } catch (err) {
        console.error("Failed to fetch all ghazals:", err);
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

  if (!ghazal) return <div className="text-rekhta-light text-center py-12">{t("ghazalNotFound")}</div>;

  const couplets = ghazal.textContent?.split("\n\n") || [];

  // Determine prev/next
  const currentIndex = allGhazals.findIndex((g) => g.id === ghazal.id);
  const prevGhazal = currentIndex > 0 ? allGhazals[currentIndex - 1] : null;
  const nextGhazal = currentIndex < allGhazals.length - 1 ? allGhazals[currentIndex + 1] : null;

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 text-rekhta-muted hover:text-rekhta-light">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("back")}
      </Button>

      <div className="mb-6">
        <h2 className={`text-2xl font-bold text-rekhta-light ${isUrdu ? "font-nastaliq text-3xl" : ""}`}>
          {transliterate(ghazal.title)}
        </h2>
      </div>


<div className="space-y-8 md:space-y-10">
  {couplets.map((couplet, i) => (
    <div key={i} className="rounded-lg border border-rekhta-border bg-rekhta-card/20 px-3 py-6 md:p-7">
      {isUrdu ? (
        <div
          className="text-rekhta-light/90 font-nastaliq"
          style={{ direction: "rtl" }}
        >
          {transliterate(couplet)
            .split("\n")
            .filter(Boolean)
            .map((line, j, arr) => {
              const words = line.trim().split(/\s+/);
              const isLastInPair = j % 2 === 1;
              return (
                <div 
                  key={j}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: words.length > 1 ? "space-between" : "center",
                    alignItems: "baseline",
                    width: "100%",
                    maxWidth: "560px",
                    margin: isLastInPair && j < arr.length - 1
                      ? "0 auto 1.5rem auto"
                      : "0 auto -1rem auto",
                    fontSize: "clamp(0.95rem, 3.8vw, 1.25rem)",
                    lineHeight: "2.4",
                  }}
                >
                  {words.map((word, k) => (
                    <span key={k}>{word}</span>
                  ))}
                </div>
              );
            })}
        </div>
      ) : (
        <pre
          className="leading-loose text-rekhta-light/90 font-serif text-justify whitespace-pre-wrap"
          style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.125rem)" }}
        >
          {transliterate(couplet)}
        </pre>
      )}
    </div>
  ))}
</div>



      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFav(ghazal.id)}
          className="text-rekhta-muted hover:text-rekhta-red"
        >
          <Heart className={`h-5 w-5 ${favIds.has(ghazal.id) ? "fill-rekhta-red text-rekhta-red" : ""}`} />
        </Button>
        <ShareDialog
          url={window.location.href}
          title={ghazal.title}
          trigger={
            <Button variant="ghost" size="icon" className="text-rekhta-muted hover:text-rekhta-light">
              <Share2 className="h-5 w-5" />
            </Button>
          }
        />
      </div>

      {/* Previous / Next Navigation */}
      {allGhazals.length > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-rekhta-border pt-6">
          {prevGhazal ? (
            <Link
              to={`/poet/${poetId}/ghazal/${prevGhazal.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 text-rekhta-muted hover:text-rekhta-gold transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">پچھلی</span>
                <span className="hidden sm:inline text-sm">{transliterate(prevGhazal.title)}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextGhazal ? (
            <Link
              to={`/poet/${poetId}/ghazal/${nextGhazal.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 text-rekhta-muted hover:text-rekhta-gold transition-colors text-right"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold">اگلی</span>
                <span className="hidden sm:inline text-sm">{transliterate(nextGhazal.title)}</span>
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

export default GhazalDetailView;
