import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";

export default function () {
  return (
    <HomeStyled>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-item">
            <span>NEW PRODUCT</span>
            <h1>XX99 Mark II Headphones</h1>
            <p>
              Experience natural, lifelike audio and exceptional build quality
              made for the passionate music enthusiast.
            </p>
            <button>See product</button>
          </div>
        </section>
      </main>
    </HomeStyled>
  );
}

const HomeStyled = styled.div`
  background-color: ${theme.colors.quaternaryColor};

  main {
    margin: 0 auto;

    .hero {
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
        button {
          cursor: pointer;
          width: 160px;
          height: 48px;
          font-size: ${theme.fonts.size.SUBTITLE};
          font-weight: ${theme.fonts.weights.bold};
          letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
          text-transform: uppercase;

          border: 2px solid ${theme.colors.primaryColor};
          background-color: ${theme.colors.primaryColor};
          color: ${theme.colors.whiteColor};

          &:hover {
            border: 2px solid ${theme.colors.primaryLightColor};
            background-color: ${theme.colors.primaryLightColor};
          }
        }
      }
    }
  }
`;
