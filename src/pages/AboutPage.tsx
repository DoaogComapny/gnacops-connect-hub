<div className="space-y-4">
  <Collapsible open={isDirectorMessageOpen} onOpenChange={setIsDirectorMessageOpen}>
    <div className="prose prose-invert max-w-none">
      <div className="text-muted-foreground leading-relaxed text-justify whitespace-pre-line">
        {(() => {
          const directorBio = aboutPage?.director?.bio?.trim();
          if (directorBio) {
            const preview = directorBio.slice(0, 500);
            const showFull = isDirectorMessageOpen || directorBio.length <= 500;

            return (
              <>
                <p className="mb-4">{showFull ? directorBio : `${preview}...`}</p>
              </>
            );
          }

          return (
            <p>
              At the Ghana National Council of Private Schools (GNACOPS), we believe that private education is not a
              privilege for the few but a partnership for progress.
              {!isDirectorMessageOpen && "..."}
            </p>
          );
        })()}
      </div>
    </div>

    {/* FULL CONTENT */}
    {aboutPage?.director?.bio && (
      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out">
        <div className="text-muted-foreground leading-relaxed text-justify mt-4 space-y-4 whitespace-pre-line">
          {(aboutPage?.director?.name || aboutPage?.director?.title) && (
            <div className="mt-6 pt-4 border-t border-card-border">
              {aboutPage.director.name && <p className="font-semibold text-foreground">{aboutPage.director.name}</p>}
              {aboutPage.director.title && <p className="text-sm text-muted-foreground">{aboutPage.director.title}</p>}
              <p className="text-sm text-muted-foreground">Ghana National Council of Private Schools (GNACOPS)</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    )}

    {/* SINGLE TRIGGER (FIXED) */}
    {aboutPage?.director?.bio?.length > 500 && (
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="mt-4 w-full sm:w-auto hover:bg-muted transition-colors flex items-center gap-2"
        >
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
</div>;
