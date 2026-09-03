import { ImageResponse } from "next/og";

export const alt = "Hank Wong's Web - Developer, Creator, Lifelong Learner";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    background: "#fafafa",
                    padding: "80px 96px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "32px",
                    }}
                >
                    <div
                        style={{
                            width: "44px",
                            height: "6px",
                            borderRadius: "9999px",
                            background: "#3b82f6",
                            display: "flex",
                        }}
                    />
                    <span style={{ fontSize: "28px", color: "#3b82f6" }}>
                        wilboerht.com
                    </span>
                </div>
                <div
                    style={{
                        fontSize: "96px",
                        fontWeight: 700,
                        color: "#171717",
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                    }}
                >
                    Hank Wong
                </div>
                <div
                    style={{
                        fontSize: "34px",
                        color: "#525252",
                        marginTop: "24px",
                        letterSpacing: "-0.01em",
                    }}
                >
                    Developer &middot; Creator &middot; Lifelong learner
                </div>
            </div>
        ),
        size
    );
}
