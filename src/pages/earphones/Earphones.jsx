import { styled } from "styled-components";
import Header from "../../components/header/Header";
import TitlePage from "../../components/page-title/TitlePage";
import Product from "../../components/products/Product";
import Categories from "../../components/categories/Categories";
import About from "../../components/about/About";
import Footer from "../../components/footer/Footer";

export default function Earphones() {
  return (
    <EarphonesStyled>
      <Header />
      <TitlePage label={"Earphones"} />

      <main>
        <Product
          subtitle={"New Product"}
          title={"YX1 Wireless Earphones"}
          description={
            "Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones. Enjoy incredible high-fidelity sound even in noisy environments with its active noise cancellation feature."
          }
          labelButton={"See product"}
          desktopImage="/assets/product-yx1-earphones/desktop/image-category-page-preview.jpg"
          tabletImage={
            "/assets/product-yx1-earphones/tablet/image-category-page-preview.jpg"
          }
          mobileImage={
            "/assets/product-yx1-earphones/mobile/image-category-page-preview.jpg"
          }
          imageAlt={"YX1 Wireless Earphones"}
        />

        <Categories />

        <About className={"margin-top-about"} />
      </main>

      <Footer />
    </EarphonesStyled>
  );
}

const EarphonesStyled = styled.div`
  main {
    padding: 160px 13.5%;

    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 160px;

    .product-image {
      img {
        width: 546px;
        height: auto;
      }
    }
    .product-infos {
      h2 {
        padding-right: 0px;
      }
    }
  }

  @media (max-width: 768px) {
    main {
      padding: 120px 13.5%;
      row-gap: 120px;

      .product-image {
        img {
          width: 304px;
        }
      }
      .product-infos {
        h2 {
          padding: 0 30px;
        }
      }

      .margin-top-categories {
        margin-top: 140px;
      }
      .margin-top-about {
        margin-top: 70px;
      }
    }
  }

  @media (max-width: 480px) {
    main {
      padding-top: 64px;
    }
  }
`;
