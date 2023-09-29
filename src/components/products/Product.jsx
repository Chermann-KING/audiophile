import { theme } from "../../theme/theme";
import { styled } from "styled-components";
import PrimaryButton from "../../components/buttons/PrimaryButton";

export default function Product({
  className,
  subtitle,
  title,
  description,
  labelButton,
  desktopImage,
  tabletImage,
  mobileImage,
  imageAlt,
}) {
  return (
    <ProductStyled className={className}>
      <div className="product-image">
        <picture>
          {desktopImage && (
            <source media="(min-width: 1025px)" srcSet={desktopImage} />
          )}
          {tabletImage && (
            <source
              media="(min-width: 768px) and (max-width: 1024px)"
              srcSet={tabletImage}
            />
          )}
          {mobileImage ? (
            <img src={mobileImage} alt={imageAlt || "Preview"} />
          ) : (
            <img src="" alt="No image" />
          )}
        </picture>
      </div>
      <div className="product-infos">
        {subtitle && <span>{subtitle}</span>}
        <h2>{title}</h2>
        <p>{description}</p>
        <PrimaryButton label={labelButton} />
      </div>
    </ProductStyled>
  );
}

const ProductStyled = styled.section`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  column-gap: 125px;

  .product-image {
    width: 540px;
    height: 560px;
    background-color: #f1f1f1;

    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }
  .product-infos {
    width: 445px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 32px;

    span,
    h2 {
      text-transform: uppercase;
    }
    span {
      color: ${theme.colors.primaryColor};
      font-size: ${theme.fonts.size.OVERLINE};
      font-weight: ${theme.fonts.weights.regular};
      letter-spacing: ${theme.fonts.charSpace.OverlineCharSpace};
      margin-bottom: -15px;
    }
    h2 {
      font-size: ${theme.fonts.size.H2};
      line-height: ${theme.fonts.lineSpace.H2LineSpace};
      color: ${theme.colors.secondaryColor};
      padding-right: 68px;
    }
    p {
      color: ${theme.colors.secondaryColor};
      font-size: ${theme.fonts.size.Body};
      line-height: ${theme.fonts.lineSpace.BodyLineSpace};
      opacity: 0.6;
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    row-gap: 52px;

    .product-image {
      width: 100%;
      height: 352px;
    }
    .product-infos {
      text-align: center;
      align-items: center;
      width: 100%;

      h2 {
        padding: 0 68px;
      }
      p {
        padding: 0 20px;
      }
    }
  }
`;
