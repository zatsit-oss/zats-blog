import LinkedinLogo from "@site/static/img/linkedin.svg";
import XLogo from "@site/static/img/x.svg";
import { usePathUrlContext } from "../context/pathContext";

const SocialsComponent = (article) => {
  const { website, socialShare } = usePathUrlContext();

  const URL = `${website}${article.articleUrl}`;

  return (
    <>
      <h2>Partager cet article :</h2>
      <a
        href={`${socialShare.linkedin}${URL}`}
        target="_blank"
        style={{ marginRight: "1rem" }}
        alt="Partager l'article sur Linkedin"
      >
        <LinkedinLogo style={{ width: "2rem", height: "2rem" }} />
      </a>
      <a
        alt="Partager l'article sur twitter"
        class="twitter-share-button"
        href={`${socialShare.x}${URL}`}
        data-size="large"
        data-text="custom share text"
        data-url="https://dev.twitter.com/web/tweet-button"
        data-hashtags="zatsit_"
        data-via="zatsit_"
        data-related="twitterapi,twitter"
        target="_blank"
      >
        <XLogo
          title="X Logo"
          className="logo"
          style={{ width: "2rem", height: "2rem" }}
          alt="X social icon"
        />
      </a>
    </>
  );
};

export default SocialsComponent;