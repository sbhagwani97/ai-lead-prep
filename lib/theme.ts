import { createTheme } from "@mui/material/styles";

const font = 'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

// One Material UI theme for the whole app, including the course pages.
export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: "#0f766e", dark: "#115e59", light: "#2dd4bf", contrastText: "#fff" },
    secondary: { main: "#d97706" },
    text: { primary: "#0f0f14", secondary: "#5f6372" },
    background: { default: "#fafbfa", paper: "#ffffff" },
    divider: "#e5e7e6",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: font,
    h1: { fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05 },
    h2: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.015em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, transition: "transform .2s ease, box-shadow .2s ease, background-color .2s ease", "&:hover": { transform: "translateY(-2px)" }, "&:active": { transform: "none" } },
        sizeLarge: { padding: "12px 22px", fontSize: 15 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: "1px solid #e5e7e6", borderRadius: 18 } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 99, height: 8, backgroundColor: "#d9f0ec" }, bar: { borderRadius: 99 } } },
  },
});
