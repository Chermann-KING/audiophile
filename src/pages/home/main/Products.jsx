import { theme } from "../../../theme/theme";
import { styled } from "styled-components";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";

export default function Products() {
  return (
    <ProductsStyled className="products">
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
            Upgrade to premium speakers that are phenomenally built to deliver
            truly remarkable sound.
          </p>
          <PrimaryButton label={"See Product"} className="button" />
        </div>
      </article>

      <article className="product-item-2">
        <div className="product-item-infos">
          <h4>ZX7 SPEAKER</h4>
          <SecondaryButton label={"See product"} />
        </div>
      </article>

      <article className="product-item-3">
        <div className="product-item-image"></div>

        <div className="product-item-infos">
          <h4>YX1 EARPHONES</h4>
          <SecondaryButton label={"See product"} />
        </div>
      </article>
    </ProductsStyled>
  );
}

const ProductsStyled = styled.section`
  height: 1296px;
  margin-top: 140px;

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
    position: relative;

    display: flex;
    justify-content: center;
    align-items: end;
    column-gap: 138px;

    background-image: url("/assets/home/desktop/pattern-circles.svg");
    background-repeat: no-repeat;
    background-size: 944px;
    background-position: -100% 10%;

    .product-item-image {
      position: relative;
      overflow-y: hidden;

      width: 410px;

      position: relative;
      bottom: 0px;

      img {
        position: relative;
        width: 100%;
        bottom: -20px;
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
    background-size: cover;
    background-position: center center;

    display: flex;
    justify-content: flex-start;

    .product-item-infos {
      align-self: center;

      height: 118px;
      padding-left: 8.5%;

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
      background-position: center;
    }

    .product-item-infos {
      align-self: center;
      background-color: ${theme.colors.tertiaryColor};
      padding-left: 8.8%;

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
        padding-right: 15%;
      }
    }
  }

  @media (max-width: 768px) {
    height: 1424px;
    gap: 32px;

    .product-item-1 {
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      height: 720px;

      background-position: 50% 120%;

      .product-item-image {
        align-self: center;

        width: 197px;
        height: 237px;

        img {
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
      background-size: cover;
      background-position: center right;
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
        /* background-position: center; */
        background-size: cover;
      }
      .product-item-infos {
        padding-left: 40px;
      }
    }
  }

  @media (max-width: 480px) {
    width: 327px;
    height: 1392px;
    gap: 24px;

    .product-item-1 {
      height: 600px;
      background-position: 50% -400%;
      background-size: 174%;
      row-gap: 32px;
      justify-content: center;

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
      .product-item-infos {
        h4 {
          padding-right: 0;
        }
      }
    }
  }
`;
