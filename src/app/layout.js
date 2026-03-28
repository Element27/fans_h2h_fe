import "./globals.css";

export const metadata = {
  title: "fan_h2h",
  description: "fan_h2h - head-to-head football quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
