<div className="space-y-4">
  {(() => {
    const directorBio = aboutPage?.director?.bio?.trim() || "";
    const previewText = directorBio.slice(0, 500);
    const hasMore = directorBio.length > 500;

    return (
      <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
        {/* Preview Text */}
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line mb-4">
            {isDirectorMessageOpen ? directorBio : `${previewText}${hasMore ? "..." : ""}`}
          </p>
        </div>

        {/* Extra Content (shows only when expanded) */}
        {hasMore && (
          <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line mt-4">{directorBio}</p>

            {(aboutPage?.director?.name || aboutPage?.director?.title) && (
              <div className="mt-6 pt-4 border-t border-card-border">
                {aboutPage.director.name && <p className="font-semibold text-foreground">{aboutPage.director.name}</p>}
                {aboutPage.director.title && (
                  <p className="text-sm text-muted-foreground">{aboutPage.director.title}</p>
                )}
                <p className="text-sm text-muted-foreground">Ghana National Council of Private Schools (GNACOPS)</p>
              </div>
            )}
          </CollapsibleContent>
        )}

        {/* SINGLE Trigger Button */}
        {hasMore && (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="mt-4 w-full sm:w-auto justify-center gap-2 hover-glow transition-all">
              {isDirectorMessageOpen ? (
                <>
                  Read Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        )}
      </Collapsible>
    );
  })()}
</div>;
