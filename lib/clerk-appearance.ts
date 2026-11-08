// Clerk theming. `appearance` restyles Clerk's own components; the logic stays Clerk's.
// Variables are applied app-wide in the layout; `authAppearance` adds layout-level tweaks
// for the sign-in and sign-up cards so they sit flat on the page.
export const baseVariables = {
  colorPrimary: "#0f766e",
  colorText: "#0f0f14",
  colorTextSecondary: "#5f6372",
  colorBackground: "#ffffff",
  colorInputBackground: "#ffffff",
  borderRadius: "0.625rem",
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontSize: "15px",
};

export const authAppearance = {
  variables: baseVariables,
  elements: {
    rootBox: { width: "100%" },
    cardBox: { width: "100%", boxShadow: "0 30px 60px -36px rgba(15,118,110,.45)", border: "1px solid #e5e7e6", borderRadius: "18px" },
    card: { boxShadow: "none" },
    headerTitle: { letterSpacing: "-0.02em", fontWeight: 800 },
    formButtonPrimary: {
      boxShadow: "none",
      fontWeight: 600,
      transition: "transform .2s ease, background .2s ease",
      "&:hover": { transform: "translateY(-1px)" },
    },
    socialButtonsBlockButton: { borderColor: "#e5e7e6", fontWeight: 600 },
    footerActionLink: { fontWeight: 600 },
  },
};
