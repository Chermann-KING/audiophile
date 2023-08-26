import { Link } from "react-router-dom";
import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import { SlBasket } from "react-icons/sl";

export default function Header() {
  return (
    <HeaderStyled>
      <div className="logo">
        <img src="/assets/shared/desktop/logo.svg" alt="audiophile-logo" />
      </div>

      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/headphones">Headphones</Link>
          </li>
          <li>
            <Link to="/speakers">Speakers</Link>
          </li>
          <li>
            <Link to="/earphones">Earphones</Link>
          </li>
        </ul>
      </nav>

      <div className="basket">
        <SlBasket />
      </div>
    </HeaderStyled>
  );
}

const HeaderStyled = styled.header`
  background-color: ${theme.colors.secondaryColor};
  color: ${theme.colors.quaternaryColor};

  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 32px 13.5%;

  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 73%;
    height: 2px;
    background: ${theme.colors.tertiaryColor};
    opacity: 0.2;
  }

  .logo {
    display: flex;
    justify-content: center;
  }

  nav > ul {
    list-style: none;
    display: flex;
    gap: 34px;
    text-transform: uppercase;

    li > a {
      color: ${theme.colors.quaternaryColor};
      font-size: ${theme.fonts.size.SUBTITLE};
      letter-spacing: ${theme.fonts.charSpace.H4CharSpace};

      &:hover {
        color: ${theme.colors.primaryColor};
      }
    }
  }
`;
