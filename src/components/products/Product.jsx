import { theme } from "../../theme/theme";
import { styled } from "styled-components";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useState } from "react";

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
  price,
}) {
  // state
  const [quantity, setQuantity] = useState(1);

  // comportement
  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

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
        {price && <p className="product-price">${price}</p>}
        <div className="action-buttons">
          <div className="quantity-container">
            {price && (
              <div className="quantity">
                <button onClick={handleDecrement}>-</button>
                <span>{quantity}</span>
                <button onClick={handleIncrement}>+</button>
              </div>
            )}
          </div>
          <PrimaryButton label={labelButton} />
        </div>
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
    p.product-price {
      font-size: ${theme.fonts.size.H6};
      color: ${theme.colors.secondaryColor};
      font-weight: ${theme.fonts.weights.bold};
      opacity: 1;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      column-gap: 16px;

      .quantity-container {
        background-color: ${theme.colors.tertiaryColor};

        .quantity {
          width: 120px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: space-around;

          font-size: ${theme.fonts.size.SUBTITLE};

          button {
            cursor: pointer;
            width: 18px;
            height: 16px;
            background-color: transparent;
            color: ${theme.colors.secondaryColor};
            border: none;
            opacity: 0.25;
            &:hover {
              color: ${theme.colors.primaryColor};
              opacity: 1;
            }
          }

          span {
            margin: 0;
            font-weight: ${theme.fonts.weights.bold};
            color: ${theme.colors.secondaryColor};
            letter-spacing: normal;
          }
        }
      }
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
