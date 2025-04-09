/**
 * Utility function to scroll to top with specified behavior
 */
export const scrollToTop = (behavior = "smooth") => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};
