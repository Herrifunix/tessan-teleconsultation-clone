/** Retour en haut de page comme `router.push` + `scrollTo({behavior:'smooth'})` de l'original,
 *  sans animation si l'utilisateur a demandé de réduire les mouvements. */
export function scrollToTop(smooth = true) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: smooth && !reduce ? 'smooth' : 'auto' });
}
