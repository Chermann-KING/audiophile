import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";
import Hero from "./main/Hero";
import Categories from "./main/Categories";
import PrimaryButton from "../../components/buttons/PrimaryButton";

export default function () {
  return (
    <HomeStyled>
      <Header />
      <main>
        <Hero />
        <Categories />
        <section className="products">
          <article className="product-item-1">
            <div className="product-item-image">
              <picture>
                <source
                  media="(min-width: 1025px)"
                  srcSet="/assets/home/desktop/image-speaker-zx9.png"
                />

                <source
                  media="(min-width: 768px) and (max-width: 1024px)"
                  srcSet="/assets/home/tablet/image-speaker-zx9.png"
                />

                <img
                  src="/assets/home/mobile/image-speaker-zx9.png"
                  alt="image-speaker-zx9"
                />
              </picture>
            </div>

            <div className="product-item-infos">
              <h2>ZX9 SPEAKER</h2>
              <p>
                Upgrade to premium speakers that are phenomenally built to
                deliver truly remarkable sound.
              </p>
              <PrimaryButton label={"See Product"} className="button" />
            </div>
          </article>

          <article className="product-item-2">
            <div className="product-item-infos">
              <h4>ZX7 SPEAKER</h4>
              <button>See product</button>
            </div>
          </article>

          <article className="product-item-3">
            <div className="product-item-image"></div>

            <div className="product-item-infos">
              <h4>YX1 EARPHONES</h4>
              <button>See product</button>
            </div>
          </article>
        </section>
      </main>
    </HomeStyled>
  );
}

const HomeStyled = styled.div`
  background-color: ${theme.colors.quaternaryColor};

  main {
    margin: 0 auto;

    .products {
      width: 1110px;
      height: 1296px;
      margin: 0 auto;

      display: flex;
      flex-direction: column;
      gap: 48px 30px;

      .product-item-1,
      .product-item-2,
      .product-item-3 {
        border-radius: 10px;
      }
      .product-item-1 {
        background-color: ${theme.colors.primaryColor};
        height: 560px;
        overflow-y: hidden;
        position: relative;

        display: flex;
        justify-content: center;
        column-gap: 138px;

        background-image: url("/assets/home/desktop/pattern-circles.svg");
        background-repeat: no-repeat;
        background-size: 944px;
        background-position: -153px -39px;

        .product-item-image {
          align-self: flex-end;

          width: 410px;
          height: 493px;

          position: relative;
          bottom: -10px;

          img {
            width: 100%;
          }
        }
        .product-item-infos {
          align-self: center;

          width: 349px;
          height: 303px;
          padding-right: 30px;
          color: ${theme.colors.whiteColor};

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          h2 {
            font-size: ${theme.fonts.size.H1};
            font-weight: ${theme.fonts.weights.bold};
            letter-spacing: ${theme.fonts.charSpace.H1CharSpace};
            line-height: ${theme.fonts.lineSpace.H1LineSpace};
          }
          p {
            font-size: ${theme.fonts.size.OVERLINE};
            font-weight: ${theme.fonts.weights.medium};
            line-height: ${theme.fonts.lineSpace.OverLineSpace};
          }
          .button {
            border: 2px solid ${theme.colors.blackColor};
            background-color: ${theme.colors.blackColor};
            color: ${theme.colors.whiteColor};

            &:hover {
              border: 2px solid #4c4c4c;
              background-color: #4c4c4c;
            }
          }
        }
      }
      .product-item-2 {
        height: 320px;
        background-image: url("/assets/home/desktop/image-speaker-zx7.jpg");
        background-repeat: no-repeat;

        display: flex;
        justify-content: flex-start;

        .product-item-infos {
          align-self: center;

          height: 118px;
          padding-left: 96px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          h4 {
            color: ${theme.colors.blackColor};
            font-size: ${theme.fonts.size.H4};
            font-weight: ${theme.fonts.weights.bold};
            letter-spacing: ${theme.fonts.charSpace.H4CharSpace};
            line-height: ${theme.fonts.lineSpace.H4LineSpace};
          }

          button {
            cursor: pointer;
            width: 160px;
            height: 48px;
            font-size: ${theme.fonts.size.SUBTITLE};
            font-weight: ${theme.fonts.weights.bold};
            letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
            text-transform: uppercase;

            border: 2px solid ${theme.colors.blackColor};
            background-color: transparent;
            color: ${theme.colors.blackColor};

            &:hover {
              color: ${theme.colors.whiteColor};
              border: 2px solid ${theme.colors.blackColor};
              background-color: ${theme.colors.blackColor};
            }
          }
        }
      }
      .product-item-3 {
        height: 320px;

        display: flex;
        justify-content: space-between;
        column-gap: 30px;

        .product-item-image,
        .product-item-infos {
          width: 540px;
          height: 100%;
          border-radius: 10px;
        }
        .product-item-image {
          background-image: url("/assets/home/desktop/image-earphones-yx1.jpg");
          background-repeat: no-repeat;
        }

        .product-item-infos {
          align-self: center;
          background-color: ${theme.colors.tertiaryColor};
          padding-left: 96px;

          display: flex;
          flex-direction: column;
          justify-content: center;
          row-gap: 32px;

          h4 {
            color: ${theme.colors.blackColor};
            font-size: ${theme.fonts.size.H4};
            font-weight: ${theme.fonts.weights.bold};
            letter-spacing: ${theme.fonts.charSpace.H4CharSpace};
            line-height: ${theme.fonts.lineSpace.H4LineSpace};
          }

          button {
            cursor: pointer;
            width: 160px;
            height: 48px;
            font-size: ${theme.fonts.size.SUBTITLE};
            font-weight: ${theme.fonts.weights.bold};
            letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
            text-transform: uppercase;

            border: 2px solid ${theme.colors.blackColor};
            background-color: transparent;
            color: ${theme.colors.blackColor};

            &:hover {
              color: ${theme.colors.whiteColor};
              border: 2px solid ${theme.colors.blackColor};
              background-color: ${theme.colors.blackColor};
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    main {
      .products {
        width: 689px;
        height: 1424px;
        gap: 32px;

        .product-item-1 {
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          height: 720px;

          background-position: -138px -312px;

          .product-item-image {
            align-self: center;

            width: 197px;
            height: 237px;
            overflow-y: hidden;

            img {
              position: relative;
              bottom: -5px;
            }
          }
          .product-item-infos {
            text-align: center;
            align-items: center;
            gap: 24px;
          }
        }
        .product-item-2 {
          background-image: url("/assets/home/tablet/image-speaker-zx7.jpg");
        }
        .product-item-3 {
          column-gap: 11px;
          height: 320px;

          .product-item-image,
          .product-item-infos {
            width: 339px;
          }
          .product-item-image {
            background-image: url("/assets/home/tablet/image-earphones-yx1.jpg");
            background-position: center;
            background-size: contain;
          }
          .product-item-infos {
            padding-left: 40px;
          }
        }
      }
    }
  }
  @media (max-width: 480px) {
    main {
      .products {
        width: 327px;
        height: 1392px;
        gap: 24px;

        .product-item-1 {
          height: 600px;
          background-position: -119px -110px;
          background-size: 566px;

          .product-item-image {
            width: 172px;
            height: 207px;
          }
          .product-item-infos {
            width: 280px;
            height: 251px;
            gap: 24px;
            padding-right: 0px;

            h2 {
              font-size: 36px;
              letter-spacing: 1.3px;
              line-height: 40px;
              padding: 0 20px;
            }
          }
        }
        .product-item-2 {
          background-image: url("/assets/home/mobile/image-speaker-zx7.jpg");
          background-size: contain;
          .product-item-infos {
            height: 118px;
            padding-left: 24px;
          }
        }
        .product-item-3 {
          flex-direction: column;
          width: 327px;
          height: 424px;
          column-gap: 24px;

          .product-item-image,
          .product-item-infos {
            width: 100%;
            height: 200px;
          }
          .product-item-image {
            background-image: url("/assets/home/mobile/image-earphones-yx1.jpg");
          }
        }
      }
    }
  }
`;
