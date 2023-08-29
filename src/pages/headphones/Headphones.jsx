import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";
import TitlePage from "../../components/page-title/TitlePage";
import Product from "./products/Product";
import Categories from "../../components/categories/Categories";
import About from "../../components/about/About";
import Footer from "../../components/footer/Footer";

export default function Headphones() {
  return (
    <HeadphonesStyled>
      <Header />
      <TitlePage label={"Headphones"} />

      <main>
        <Product
          subtitle={"New product"}
          title={"XX99 Mark II Headphones"}
          description={
            "The new XX99 Mark II headphones is the pinnacle of pristine audio. It redefines your premium headphone experience by reproducing the balanced depth and precision of studio-quality sound."
          }
          labelButton={"See product"}
          desktopImage="/assets/shared/desktop/image-xx99-mark-two-headphones.jpg"
          tabletImage="/assets/shared/tablet/image-xx99-mark-two-headphones.jpg"
          mobileImage="/assets/shared/mobile/image-xx99-mark-two-headphones.jpg"
          imageAlt="XX99 Mark II Headphones"
        />
        <Product
          className={"reverse"}
          title={"XX99 Mark I Headphones"}
          description={
            "As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction for audiophiles, mixing engineers, and music aficionados alike in studios and on the go."
          }
          labelButton={"See product"}
          desktopImage={
            "/assets/shared/desktop/image-xx99-mark-one-headphones.jpg"
          }
          tabletImage={
            "/assets/shared/tablet/image-xx99-mark-one-headphones.jpg"
          }
          mobileImage={
            "/assets/shared/mobile/image-xx99-mark-one-headphones.jpg"
          }
          imageAlt={"XX99 Mark One Headphones"}
        />
        <Product
          className={"margin"}
          title={"XX59 Headphones"}
          description={
            "Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones. The stylish yet durable versatile wireless headset is a brilliant companion at home or on the move."
          }
          labelButton={"See product"}
          desktopImage={"/assets/shared/desktop/image-xx59-headphones.jpg"}
          tabletImage={"/assets/shared/tablet/image-xx59-headphones.jpg"}
          mobileImage={"/assets/shared/mobile/image-xx59-headphones.jpg"}
          imageAlt={"XX59 Headphones"}
        />

        <Categories />
        <About />
      </main>

      <Footer />
    </HeadphonesStyled>
  );
}

const HeadphonesStyled = styled.div`
  main {
    margin: 0 13.5%; // to review
    margin-top: 160px;

    .reverse {
      flex-direction: row-reverse;
    }
    .margin {
      margin-bottom: 0px;
    }
  }
`;
