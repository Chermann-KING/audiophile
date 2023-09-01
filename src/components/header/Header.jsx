import { Link, NavLink } from "react-router-dom";
import { styled } from "styled-components";
import { theme } from "../../theme/theme";
import { SlBasket } from "react-icons/sl";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HeaderStyled>
      <div
        className="hamburger"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <img src="/assets/shared/tablet/icon-hamburger.svg" alt="menu" />
      </div>

      <div className="logo">
        <Link to={"/"}>
          <img src="/assets/shared/desktop/logo.svg" alt="audiophile-logo" />
        </Link>
      </div>

      {isOpen && (
        <div className="overlay">
          <nav className="tablet-menu">
            <ul>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/headphones">Headphones</NavLink>
              </li>
              <li>
                <NavLink to="/speakers">Speakers</NavLink>
              </li>
              <li>
                <NavLink to="/earphones">Earphones</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <nav className="desktop-menu">
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/headphones">Headphones</NavLink>
          </li>
          <li>
            <NavLink to="/speakers">Speakers</NavLink>
          </li>
          <li>
            <NavLink to="/earphones">Earphones</NavLink>
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

  /* position: relative; */
  z-index: 1;
  position: sticky;
  top: 0; //if I want to fix the header at the top of the page during scrolling

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
    margin-right: 20px;
  }

  .active {
    color: ${theme.colors.primaryColor};
  }

  .hamburger {
    display: none;
    cursor: pointer;
  }

  nav > ul {
    margin: 0 20px;
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

  .overlay {
    background-color: ${theme.colors.secondaryColor};
    position: fixed;
    top: 92px;
    left: 0;
    right: 0;
    bottom: 0;
    height: 290px;
    display: none;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s ease-in-out;

    .tablet-menu > ul {
      display: flex;
      flex-direction: column;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hamburger {
      display: flex;
    }
    .desktop-menu {
      display: none;
    }
    .overlay {
      display: flex;
    }
  }
`;
