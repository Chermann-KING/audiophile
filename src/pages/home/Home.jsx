import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import Header from "../../components/header/Header";
import Hero from "./main/Hero";
import { IoIosArrowForward } from "react-icons/io";

export default function () {
  return (
    <HomeStyled>
      <Header />
      <main>
        <Hero />
        <section className="categories">
          <div className="category-item">
            <picture>
              <img
                src="/assets/shared/desktop/image-category-thumbnail-headphones.png"
                alt="image-category-thumbnail-headphones"
              />
            </picture>
            <h6>Headphones</h6>
            <button>
              <span className="button-label">Shop</span>
              <span className="button-icon">
                <IoIosArrowForward />
              </span>
            </button>
          </div>

          <div className="category-item">
            <picture>
              <img
                src="/assets/shared/desktop/image-category-thumbnail-speakers.png"
                alt="image-category-thumbnail-speakers"
              />
            </picture>
            <h6>Speakers</h6>
            <button>
              <span className="button-label">Shop</span>
              <span className="button-icon">
                <IoIosArrowForward />
              </span>
            </button>
          </div>

          <div className="category-item">
            <picture>
              <img
                src="/assets/shared/desktop/image-category-thumbnail-earphones.png"
                alt="image-category-thumbnail-earphones"
              />
            </picture>
            <h6>Earphones</h6>
            <button>
              <span className="button-label">Shop</span>
              <span className="button-icon">
                <IoIosArrowForward />
              </span>
            </button>
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

    .categories {
      background-color: ${theme.colors.quaternaryColor};
      width: 1110px;
      height: 284px;

      margin: 120px auto;

      display: flex;
      align-items: end;
      justify-content: space-between;

      .category-item {
        width: 350px;
        height: 204px;
        background-color: ${theme.colors.tertiaryColor};
        border-radius: 8px;
        padding-bottom: 30px;

        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: center;
        gap: 15px;

        position: relative;

        picture {
          width: 176px;

          position: absolute;
          top: -30%;
          left: 50%;
          transform: translateX(-50%);

          img {
            max-width: 100%;
            height: auto;
          }
        }

        h6 {
          font-size: ${theme.fonts.size.H6};
        }

        button {
          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;

          font-size: ${theme.fonts.size.SUBTITLE};
          font-weight: ${theme.fonts.weights.bold};
          letter-spacing: ${theme.fonts.charSpace.SubtilteCharSpace};
          text-transform: uppercase;

          border: none;
          background-color: transparent;

          .button-label {
            color: ${theme.colors.blackColor};
            opacity: 0.6;
            /* &:hover {
              color: ${theme.colors.primaryColor};
              opacity: 1;
            } */
          }
          .button-icon {
            color: ${theme.colors.primaryColor};
          }
        }

        &:hover {
          cursor: pointer;
          button .button-label {
            color: ${theme.colors.primaryColor};
            opacity: 1;
          }
        }
      }
    }
  }
`;
