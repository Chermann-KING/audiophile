import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import { IoIosArrowForward } from "react-icons/io";
import TertiaryButton from "../buttons/TertiaryButton";

export default function Categories({ className }) {
  return (
    <CategoriesStyled className={className}>
      <div className="category-item">
        <picture>
          <img
            src="/assets/shared/desktop/image-category-thumbnail-headphones.png"
            alt="image-category-thumbnail-headphones"
          />
        </picture>
        <h6>Headphones</h6>
        <TertiaryButton label={"Shop"} icon={<IoIosArrowForward />} />
      </div>

      <div className="category-item">
        <picture>
          <img
            src="/assets/shared/desktop/image-category-thumbnail-speakers.png"
            alt="image-category-thumbnail-speakers"
          />
        </picture>
        <h6>Speakers</h6>
        <TertiaryButton label={"Shop"} icon={<IoIosArrowForward />} />
      </div>

      <div className="category-item">
        <picture>
          <img
            src="/assets/shared/desktop/image-category-thumbnail-earphones.png"
            alt="image-category-thumbnail-earphones"
          />
        </picture>
        <h6>Earphones</h6>
        <TertiaryButton label={"Shop"} icon={<IoIosArrowForward />} />
      </div>
    </CategoriesStyled>
  );
}

const CategoriesStyled = styled.section`
  height: 284px;
  width: 100%;

  margin: 120px auto;

  display: flex;
  align-items: end;
  justify-content: space-between;
  grid-column: 30px;

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

    &:hover {
      cursor: pointer;
      button .button-label {
        color: ${theme.colors.primaryColor};
        opacity: 1;
      }
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    width: 100%;
    height: 217px;
    column-gap: 10px;

    margin: 96px auto;

    .category-item {
      width: 223px;
      height: 165px;

      picture {
        width: 103px;
        top: -18%;
      }
    }
  }

  @media (max-width: 480px) {
    height: 683px;
    row-gap: 16px;

    flex-direction: column;
    align-items: center;

    margin-bottom: 120px;

    .category-item {
      width: 100%;
      height: 165px;

      picture {
        width: 103px;
        top: -18%;
      }
    }
  }
`;
