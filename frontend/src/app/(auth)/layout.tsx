export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen overflow-hidden bg-[#f5f7f8] dark:bg-[#101a22]">
            {children}
        </div>
    );
}
