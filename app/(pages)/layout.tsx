import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { Fragment } from "react";

interface PagesLayoutProps {
    children: React.ReactNode;
}

const PagesLayout = async ({ children }: PagesLayoutProps) => {
    return (
        <Fragment>
            <Header />
            <div id="pages-layout">{children}</div>
            <Footer />
        </Fragment>
    );
};

export default PagesLayout;
