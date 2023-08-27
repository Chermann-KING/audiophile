import React from "react";
import { theme } from "../../../theme/theme";
import { styled } from "styled-components";
import PrimaryButton from "../../../components/buttons/PrimaryButton";

export default function Hero() {
  return (
    <HeroStyled className="hero">
      <div className="hero-item">
        <span>NEW PRODUCT</span>
        <h1>XX99 Mark II Headphones</h1>
        <p>
          Experience natural, lifelike audio and exceptional build quality made
          for the passionate music enthusiast.
        </p>
        <PrimaryButton label={"See product"} />
      </div>
    </HeroStyled>
  );
}

const HeroStyled = styled.section`
  height: 90vh;
  background-color: ${theme.colors.secondaryColor};
  padding: 30px 13.5%;

  background-image: url("/assets/home/desktop/image-hero.jpg");
  background-position: bottom center;
  background-repeat: no-repeat;
  background-size: cover;

  display: flex;
  align-items: center;

  .hero-item {
    width: 398px;
    height: 346px;
    padding-right: 32px;

    display: flex;
    flex-direction: column;
    justify-content: space-around;

    span {
      color: ${theme.colors.quaternaryColor};
      font-size: ${theme.fonts.size.OVERLINE};
      font-weight: ${theme.fonts.weights.regular};
      letter-spacing: ${theme.fonts.charSpace.OverlineCharSpace};
      opacity: 0.45;
    }
    h1 {
      font-size: ${theme.fonts.size.H1};
      line-height: ${theme.fonts.lineSpace.H1LineSpace};
      color: ${theme.colors.tertiaryColor};
    }
    p {
      color: ${theme.colors.quaternaryColor};
      font-size: ${theme.fonts.size.Body};
      line-height: ${theme.fonts.lineSpace.BodyLineSpace};
      opacity: 0.6;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    background-image: url("/assets/home/tablet/image-header.jpg");
    background-position: center;
    justify-content: center;

    .hero-item {
      padding: 0px 13px;
      text-align: center;
      align-items: center;
    }
  }
  @media (max-width: 480px) {
    background-image: url("/assets/home/mobile/image-header.jpg");
    background-position: bottom center;

    .hero-item {
      h1 {
        font-size: 36px;
        line-height: 40px;
      }
    }
  }
`;
