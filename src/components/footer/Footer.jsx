import { Link } from "react-router-dom";
import { theme } from "../../theme/theme";
import { styled } from "styled-components";

export default function Footer() {
  return (
    <FooterStyled>
      <div className="footer-top">
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
      </div>

      <div className="footer-middle">
        <p>
          Audiophile is an all in one stop to fulfill your audio needs. We're a
          small team of music lovers and sound specialists who are devoted to
          helping you get the most out of personal audio. Come and visit our
          demo facility - we’re open 7 days a week.
        </p>
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          <p>Copyright 2021. All Rights Reserved</p>
        </div>

        <div className="social-networks">
          <a href="https://facebook.com">
            <img
              src="/assets/shared/desktop/icon-facebook.svg"
              alt="facebook-icon"
            />
          </a>
          <a href="https://twitter.com">
            <img
              src="/assets/shared/desktop/icon-twitter.svg"
              alt="twitter-icon"
            />
          </a>
          <a href="https://instagram.com">
            <img
              src="/assets/shared/desktop/icon-instagram.svg"
              alt="instagram-icon"
            />
          </a>
        </div>
      </div>
    </FooterStyled>
  );
}

const FooterStyled = styled.footer`
  background-color: ${theme.colors.secondaryColor};

  height: 365px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 36px;

  padding: 32px 13.5%;

  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 13.5%;
    width: 101px;
    height: 4px;
    background: ${theme.colors.primaryColor};
  }

  .footer-top {
    margin: 0 auto;

    margin-top: 45px;

    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

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
  }

  .footer-middle {
    align-self: flex-start;

    width: 540px;
    height: 100px;

    p {
      color: ${theme.colors.whiteColor};
      font-size: ${theme.fonts.size.OVERLINE};
      font-weight: ${theme.fonts.weights.medium};
      line-height: ${theme.fonts.lineSpace.OverLineSpace};
      opacity: 0.6;
      padding-right: 30px;
    }
  }

  .footer-bottom {
    width: 100%;

    display: flex;
    justify-content: space-between;
    align-items: center;

    .copyright {
      p {
        color: ${theme.colors.whiteColor};
        font-size: ${theme.fonts.size.OVERLINE};
        font-weight: ${theme.fonts.weights.bold};
        line-height: ${theme.fonts.lineSpace.OverLineSpace};
        opacity: 0.6;
      }
    }

    .social-networks {
      margin-top: -120px;
      a {
        margin-left: 16px;

        img {
          transition: fill 0.3s;
          &:hover {
            filter: brightness(0) saturate(100%) invert(36%) sepia(94%)
              saturate(1398%) hue-rotate(359deg) brightness(92%) contrast(89%);
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    height: 400px;
    padding: 32px 6.5%;
    justify-content: space-between;
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 6%;
      width: 101px;
      height: 4px;
      background: ${theme.colors.primaryColor};
    }
    .footer-top {
      flex-wrap: wrap;
      flex-direction: column;
      align-items: start;
      row-gap: 32px;
    }
    .footer-middle {
      width: 100%;
      p {
        padding-right: 0px;
      }
    }
    .footer-bottom {
      .social-networks {
        margin-top: 0px;
      }
    }
  }

  @media (max-width: 480px) {
    height: 654px;
    text-align: center;
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 101px;
      height: 4px;
      background: ${theme.colors.primaryColor};
    }
    .footer-top {
      flex-wrap: wrap;
      flex-direction: column;
      align-items: center;
      row-gap: 48px;
      nav > ul {
        width: 100%;
        font-weight: ${theme.fonts.weights.bold};
        flex-direction: column;
      }
    }

    .footer-bottom {
      height: 97px;
      flex-direction: column;
      gap: 48px;
    }
  }
`;
