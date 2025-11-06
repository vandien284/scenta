export const revalidate = 60;

import ProductDetail from "@/components/san-pham/ProductDetail";
import InfoTabs from "@/components/san-pham/InfoTabs";
import ProductReviews from "@/components/san-pham/ProductReviews";
import ProductSlider from "@/widgets/ProductSlider";
import { TabProductSlider } from "@/data/TabsData";
import { getProductByUrlAction } from "@/app/actions/getProductsAction";
import { getAllProducts } from "@/lib/productSource";
import styles from "@/styles/components/san-pham/productDetail.module.scss";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;
type ProductResult = Awaited<ReturnType<typeof getProductByUrlAction>>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  let product: ProductResult | null = null;
  let loadError = false;

  try {
    product = await getProductByUrlAction(slug);
  } catch (error) {
    loadError = true;
    console.error("[ProductDetail] Unable to load product metadata from blob:", error);
  }

  if (!product) {
    if (loadError) {
      return {
        title: "Đang tải sản phẩm | Scenta",
        description: "Chúng tôi đang tải dữ liệu sản phẩm. Vui lòng thử lại sau.",
      };
    }

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
      images: product.images?.length ? [{ url: `https://scenta-eta.vercel.app/${product.images[0]}` }] : [],
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

  let product: ProductResult | null = null;
  let productLoadError = false;

  try {
    product = await getProductByUrlAction(slug);
  } catch (error) {
    productLoadError = true;
    console.error("[ProductDetail] Unable to load product detail from blob:", error);
  }

  if (!product) {
    if (productLoadError) {
      return (
        <div className={styles.pageWrapper}>
          <div className="container-width">
            <div className={styles.loadingFallback} role="status">
              Đang tải dữ liệu sản phẩm...
            </div>
          </div>
        </div>
      );
    }

    notFound();
  }

  let allProducts: Awaited<ReturnType<typeof getAllProducts>> | null = null;

  try {
    allProducts = await getAllProducts();
  } catch (error) {
    console.error("[ProductDetail] Unable to load related products from blob:", error);
  }

  return (
    <div className={styles.pageWrapper}>
      <div className="container-width" style={{ overflow: "hidden" }}>
        <ProductDetail product={product} />
        <InfoTabs />
        <ProductReviews product={product} />
        {allProducts ? (
          <ProductSlider tabs={TabProductSlider} data={allProducts} />
        ) : (
          <div className={styles.loadingFallback} role="status">
            Đang tải gợi ý sản phẩm...
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailProductPage;
