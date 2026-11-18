export default function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="border-t-2 border-primary" />
      {children}
    </div>
  );
}
