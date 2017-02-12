
export const getWidth = (state) => {
  return (state.browser.width > 765 ?
    765 : // 765 is premier's width for CV
    state.browser.width) - 50; // 50 is a magic number. :-/
};
