// Tells the ambient layer (zb-ambient.js) to skip its wet-hide background on a
// page that renders its own. Import it before zb-ambient.js.
if (typeof window !== "undefined") window.ZB_NO_WET = true;
