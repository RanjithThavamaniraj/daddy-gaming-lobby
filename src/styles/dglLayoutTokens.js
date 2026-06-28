/**
 * Shared layout rhythm for DGL pages.
 * Spacing and width only — no visual identity changes.
 */
export const dglLayoutTokens = `
  :root {
    --dgl-content-max: 1280px;
    --dgl-page-gutter-x: clamp(1.25rem, 4vw, 3rem);
    --dgl-page-gutter-y: clamp(1.25rem, 3vw, 2.25rem);
    --dgl-section-gap: clamp(2.5rem, 5vw, 3.5rem);
    --dgl-section-gap-lg: clamp(3.5rem, 6vw, 5rem);
    --dgl-block-gap: clamp(2rem, 4vw, 2.5rem);
    --dgl-title-gap: 2rem;
    --dgl-nav-gap: 2rem;
  }
`;
