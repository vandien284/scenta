import { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: {
    params: Params;
}): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;



    //   if (!data.ceramic) {
    //     return {
    //       title: "Sản phẩm không tồn tại | Gốm Sứ ATZ",
    //       description: "Sản phẩm bạn tìm kiếm không có trong bộ sưu tập.",
    //     };
    //   }

    return {
        // title: `${data.ceramic.name} | Gốm Sứ ATZ`,
        // description:
        //   data.ceramic.shortDescription ||
        //   "Khám phá sản phẩm gốm sứ tinh xảo tại ATZ.",
        // openGraph: {
        //   title: `${data.ceramic.name} | Gốm Sứ ATZ`,
        //   description: data.ceramic.shortDescription ||
        //     "Khám phá sản phẩm gốm sứ tinh xảo tại ATZ.",
        //   images: data.ceramic.images?.length ? [{ url: `https://gomsusuutam.com`+generateImageUrl(data.ceramic.images[0].url) }] : [],
        //   url: `https://gomsusuutam.com/cuahang/${data.ceramic.url}`,
        //   siteName: "Gốm Sứ ATZ",
        //   locale: "vi_VN",
        //   type: "website",
        // },
    };
}

const DetailProductPage = async (props: { params: Params }) => {
    const params = await props.params;
    const { slug } = params;
    return <div>Detail Product Page</div>;
}

export default DetailProductPage;