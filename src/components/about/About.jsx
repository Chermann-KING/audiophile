import { theme } from "../../theme/theme";
import { styled } from "styled-components";

export default function About() {
  return (
    <AboutStyled className="about">
      <div className="about-infos">
        <h2>
          Bringing you the <span>best</span> audio gear
        </h2>
        <p>
          Located at the heart of New York City, Audiophile is the premier store
          for high end headphones, earphones, speakers, and audio accessories.
          We have a large showroom and luxury demonstration rooms available for
          you to browse and experience a wide range of our products. Stop by our
          store to meet some of the fantastic people who make Audiophile the
          best place to buy your portable audio equipment.
        </p>
      </div>

      <div
        className="about-image"
        role="img"
        aria-label="best-gear-image"
      ></div>
    </AboutStyled>
  );
}

const AboutStyled = styled.section`
  margin: 200px auto;
  height: 588px;
  width: 100%;

  display: flex;
  align-items: center;
  column-gap: 10%;

  .about-infos {
    width: 445px;
    min-width: 294px;
    height: 295px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 32px;

    color: ${theme.colors.secondaryColor};

    h2 {
      font-size: ${theme.fonts.size.H2};
      font-weight: ${theme.fonts.weights.bold};
      line-height: ${theme.fonts.lineSpace.H2LineSpace};
      letter-spacing: ${theme.fonts.charSpace.H2CharSpace};
      text-transform: uppercase;

      span {
        color: ${theme.colors.primaryColor};
      }
    }
    p {
      font-size: ${theme.fonts.size.SUBTITLE};
      font-weight: ${theme.fonts.weights.medium};
      line-height: ${theme.fonts.lineSpace.SubtitleLineSpace};
      letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
      opacity: 0.6;
    }
  }
  .about-image {
    width: 540px;
    height: 100%;

    border-radius: 10px;

    background-image: url("/assets/shared/desktop/image-best-gear.jpg");
    background-repeat: no-repeat;
    background-position: center;
  }

  @media (max-width: 768px) {
    height: 633px;
    width: 100%;

    flex-direction: column-reverse;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    row-gap: 63px;

    .about-image {
      width: 100%;
      height: 300px;

      background-image: url("/assets/shared/tablet/image-best-gear.jpg");
      background-size: cover;
    }

    .about-infos {
      width: 100%;
      justify-content: space-between;
      row-gap: 10%;
      padding: 0 3%;

      p {
        letter-spacing: normal;
      }
    }
  }
  @media (max-width: 480px) {
    margin: 120px auto;
    width: 327px;
    height: 698px;

    .about-image {
      width: 100%;
      height: 300px;

      background-image: url("/assets/shared/mobile/image-best-gear.jpg");
    }
    .about-infos {
      width: 100%;
      height: 358px;
      row-gap: 32px;

      h2 {
        font-size: 28px;
        line-height: normal;
      }
    }
  }
`;
