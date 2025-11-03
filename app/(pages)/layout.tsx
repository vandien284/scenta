import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import ChatAssistant from "@/components/common/ChatAssistant";
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
            <ChatAssistant />
        </Fragment>
    );
};

export default PagesLayout;
