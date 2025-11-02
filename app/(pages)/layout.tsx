import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { Fragment } from "react";

interface PagesLayoutProps {
    children: React.ReactNode;
}

const PagesLayout = ({ children }: PagesLayoutProps) => {


    return (
        <Fragment>
            <Header />
            <main id="pages-layout">{children}</main>
            <Footer />
        </Fragment>
    );
};

export default PagesLayout;
