import { styled } from "styled-components";
import TitlePage from "../../components/page-title/TitlePage";
import Header from "../../components/header/Header";
import Product from "../../components/products/Product";
import Categories from "../../components/categories/Categories";
import About from "../../components/about/About";
import Footer from "../../components/footer/Footer";

export default function Speakers() {
  return (
    <SpeakersStyled>
      <Header />
      <TitlePage label={"Seapkers"} />

      <main>
        <Product
          subtitle={"New Product"}
          title={"ZX9 Speaker"}
          description={
            "Upgrade your sound system with the all new ZX9 active speaker. It’s a bookshelf speaker system that offers truly wireless connectivity -- creating new possibilities for more pleasing and practical audio setups."
          }
          labelButton={"See product"}
          desktopImage="/assets/shared/desktop/image-zx9-speaker.jpg"
          tabletImage={"/assets/shared/tablet/image-zx9-speaker.jpg"}
          mobileImage={"/assets/shared/mobile/image-zx9-speaker.jpg"}
          imageAlt={"ZX9 Speaker"}
        />
        <Product
          className={"reverse margin-bottom"}
          title={"ZX7 Speaker"}
          description={
            "Stream high quality sound wirelessly with minimal loss. The ZX7 bookshelf speaker uses high-end audiophile components that represents the top of the line powered speakers for home or studio use."
          }
          labelButton={"See product"}
          desktopImage="/assets/shared/desktop/image-zx7-speaker.jpg"
          tabletImage={"/assets/shared/tablet/image-zx7-speaker.jpg"}
          mobileImage={"/assets/shared/mobile/image-zx7-speaker.jpg"}
          imageAlt={"ZX7 Speaker"}
        />
        <Categories />
        <About className={"margin-top-about"} />
      </main>

      <Footer />
    </SpeakersStyled>
  );
}

const SpeakersStyled = styled.div`
  main {
    padding: 160px 13.5%;

    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 160px;

    h2 {
      margin-right: 30%;
    }

    .reverse {
      flex-direction: row-reverse;
    }
    .margin-bottom {
      margin-bottom: 40px;
    }
  }

  @media (max-width: 768px) {
    main {
      padding: 120px 13.5%;
      row-gap: 120px;

      span {
        transform: translateX(10px);
      }
      h2 {
        margin: 0px 10%;
      }
      .reverse {
        flex-direction: column;
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
