export const revalidate = 60;
import ProductDetail from "@/components/san-pham/ProductDetail";
import { Metadata } from "next";
import styles from "@/styles/components/san-pham/productDetail.module.scss";
import InfoTabs from "@/components/san-pham/InfoTabs";
import ProductSlider from "@/widgets/ProductSlider";
import ProductReviews from "@/components/san-pham/ProductReviews";
import { TabProductSlider } from "@/data/TabsData";
import { getProductByUrlAction } from "@/app/actions/getProductsAction";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/productSource";

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: {
    params: Params;
}): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;
    const product = await getProductByUrlAction(slug);

    if (!product) {
        return {
            title: "Sản phẩm không tồn tại | Scenta",
            description: "Sản phẩm bạn tìm kiếm không có trong bộ sưu tập.",
        };
    }
    return {
        title: `${product.name} | Scenta`,
        description: product.description,
        openGraph: {
            title: `${product.name} | Scenta`,
            description: product.description,
            images: product.images?.length
                ? [{ url: `https://scenta-eta.vercel.app/${product.images[0]}` }]
                : [],
            url: `https://scenta-eta.vercel.app/san-pham/${product.url}`,
            siteName: "Scenta",
            locale: "vi_VN",
            type: "website",
        },
    };
}

const DetailProductPage = async (props: { params: Params }) => {
    const params = await props.params;
    const { slug } = params;
    const product = await getProductByUrlAction(slug);
    if (!product) {
        notFound();
    }

    const allProducts = await getAllProducts();

    return (
        <div className={styles.pageWrapper}>
            <div className="container-width" style={{overflow: "hidden"}}>
                <ProductDetail product={product} />
                    <InfoTabs />
                    <ProductReviews product={product} />
                    <ProductSlider tabs={TabProductSlider} data={allProducts} />
            </div>
        </div>
    );
}

export default DetailProductPage;
